import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const SalesByItemReport = () => {
    const navigate = useNavigate();
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

    // Filter States
    const [startDate, setStartDate] = useState(getDefaultStartDate());
    const [endDate, setEndDate] = useState(getDefaultEndDate());
    const [itemFrom, setItemFrom] = useState("");
    const [itemTo, setItemTo] = useState("");
    const [categoryFrom, setCategoryFrom] = useState("");
    const [categoryTo, setCategoryTo] = useState("");
    const [itemType, setItemType] = useState("Both"); // Both, Physical, Service
    const [style, setStyle] = useState("Detailed"); // Detailed, Summary
    const [cost, setCost] = useState("Average"); // Last, Average
    const [includeCreditNotes, setIncludeCreditNotes] = useState(true);

    // Response states
    const [reportData, setReportData] = useState([]);
    const [grandTotal, setGrandTotal] = useState(null);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);

    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    const handleReset = () => {
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
        setItemFrom("");
        setItemTo("");
        setCategoryFrom("");
        setCategoryTo("");
        setItemType("Both");
        setStyle("Detailed");
        setCost("Average");
        setIncludeCreditNotes(true);
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
                item_from: itemFrom || null,
                item_to: itemTo || null,
                category_from: categoryFrom || null,
                category_to: categoryTo || null,
                item_type: itemType,
                style: style,
                cost: cost,
                include_credit_notes: includeCreditNotes
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}GetSalesByItemReport`,
                payload
            );

            if (response.data && response.data.success) {
                setReportData(response.data.data || []);
                setGrandTotal(response.data.grand_total || null);
            } else {
                toast.error(response.data?.message || "Failed to fetch report");
            }
        } catch (error) {
            console.error("Error fetching sales by item report:", error);
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
                route_url: "/Admin/sales-by-item-report",
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

    // Helpers
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
        const currencySymbol = getCurrencySymbol(currencyCode);
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

    const getItemFilterText = () => {
        if (!itemFrom && !itemTo) return "All Items";
        if (itemFrom === itemTo) return itemFrom;
        return `${itemFrom || "A"} to ${itemTo || "Z"}`;
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
                                <h4 className="freight_hd">Sales by Item</h4>
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

                                <div className="col-lg-2 col-md-4 col-sm-6">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Item</label>
                                    <div className="d-flex gap-1">
                                        <select
                                            className="form-select form-select-sm"
                                            value={itemFrom}
                                            onChange={(e) => setItemFrom(e.target.value)}
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
                                            value={itemTo}
                                            onChange={(e) => setItemTo(e.target.value)}
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

                                <div className="col-lg-1 col-md-2 col-sm-4">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Item Type</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={itemType}
                                        onChange={(e) => setItemType(e.target.value)}
                                    >
                                        <option value="Both">Both</option>
                                        <option value="Physical">Physical</option>
                                        <option value="Service">Service</option>
                                    </select>
                                </div>

                                <div className="col-lg-1 col-md-2 col-sm-4">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Style</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={style}
                                        onChange={(e) => setStyle(e.target.value)}
                                    >
                                        <option value="Detailed">Detailed</option>
                                        <option value="Summary">Summary</option>
                                    </select>
                                </div>

                                <div className="col-lg-1 col-md-2 col-sm-4">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Cost</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                    >
                                        <option value="Average">Average</option>
                                        <option value="Last">Last</option>
                                    </select>
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
                                    <h4 className="report-title mb-1 fw-bold text-dark">Sales By Item Report</h4>
                                    <h6 className="report-subtitle mb-4 fw-bold text-secondary">Asia Direct Africa</h6>

                                    <div className="report-meta-info mt-3">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Item Range:</span>
                                                    <span className="text-secondary">{getItemFilterText()}</span>
                                                </div>
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Category:</span>
                                                    <span className="text-secondary">{getCategoryFilterText()}</span>
                                                </div>
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Item Type:</span>
                                                    <span className="text-secondary">{itemType}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Date Range:</span>
                                                    <span className="text-secondary">{getDateRangeText()}</span>
                                                </div>
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Style:</span>
                                                    <span className="text-secondary">{style}</span>
                                                </div>
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Cost Mode:</span>
                                                    <span className="text-secondary">{cost}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Report Table */}
                                <div className="table-responsive mt-4">
                                    {style === "Detailed" ? (
                                        <table className="report-table">
                                            <thead>
                                                <tr className="header-top-row">
                                                    <th colSpan="3" className="text-start align-bottom pb-1" style={{ width: "50%" }}>Name</th>
                                                    <th rowSpan="2" className="text-end align-bottom pb-2" style={{ width: "8%" }}>Qty</th>
                                                    <th rowSpan="2" className="text-end align-bottom pb-2" style={{ width: "10%" }}>Cost</th>
                                                    <th rowSpan="2" className="text-end align-bottom pb-2" style={{ width: "11%" }}>Selling</th>
                                                    <th rowSpan="2" className="text-end align-bottom pb-2" style={{ width: "13%" }}>GP Amount</th>
                                                    <th rowSpan="2" className="text-end align-bottom pb-2" style={{ width: "8%" }}>GP %</th>
                                                </tr>
                                                <tr className="header-bottom-row">
                                                    <th className="text-start pt-1 pb-2" style={{ width: "10%" }}>Date</th>
                                                    <th className="text-start pt-1 pb-2" style={{ width: "12%" }}>Document No</th>
                                                    <th className="text-start pt-1 pb-2" style={{ width: "28%" }}>Customer</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.length > 0 ? (
                                                    reportData.map((itemGroup, itemIndex) => {
                                                        const totalInfo = itemGroup.total || {};
                                                        return (
                                                            <React.Fragment key={itemIndex}>
                                                                {/* Item Header Row */}
                                                                <tr className="customer-name-row">
                                                                    <td colSpan="8" className="text-start">
                                                                        {itemGroup.item_name || "Unnamed Item"}
                                                                    </td>
                                                                </tr>
                                                                {/* Item Transaction Rows */}
                                                                {itemGroup.rows && itemGroup.rows.length > 0 ? (
                                                                    itemGroup.rows.map((row, rowIndex) => (
                                                                        <tr key={`${itemIndex}-${rowIndex}`} className="invoice-item-row">
                                                                            <td className="text-start">
                                                                                {formatDateString(row.date)}
                                                                            </td>
                                                                            <td className="text-start">
                                                                                {row.document_no || "-"}
                                                                            </td>
                                                                            <td className="text-start">
                                                                                {row.customer || "-"}
                                                                            </td>
                                                                            <td className="text-end">
                                                                                {parseFloat(row.qty || 0).toFixed(4)}
                                                                            </td>
                                                                            <td className="text-end">
                                                                                {formatCurrency(row.total_cost, row.final_base_currency)}
                                                                            </td>
                                                                            <td className="text-end">
                                                                                {formatCurrency(row.total_selling, row.final_base_currency)}
                                                                            </td>
                                                                            <td className="text-end">
                                                                                {formatCurrency(row.gp_amount, row.final_base_currency)}
                                                                            </td>
                                                                            <td className="text-end">
                                                                                {parseFloat(row.gp_percent || 0).toFixed(2)}%
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="8" className="text-center text-muted py-2">
                                                                            No sales records for this item.
                                                                        </td>
                                                                    </tr>
                                                                )}

                                                                {/* Spacer Row between items */}
                                                                <tr className="spacer-row" style={{ height: "20px" }}>
                                                                    <td colSpan="8"></td>
                                                                </tr>
                                                            </React.Fragment>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="8" className="text-center text-muted py-4">
                                                            No data available for the selected filters.
                                                        </td>
                                                    </tr>
                                                )}

                                            </tbody>
                                        </table>
                                    ) : (
                                        <table className="report-table">
                                            <thead>
                                                <tr className="header-top-row header-bottom-row">
                                                    <th className="text-start py-2" style={{ width: "40%" }}>Item Name</th>
                                                    <th className="text-end py-2" style={{ width: "10%" }}>Total Qty</th>
                                                    <th className="text-end py-2" style={{ width: "12%" }}>Total Cost</th>
                                                    <th className="text-end py-2" style={{ width: "13%" }}>Total Sales</th>
                                                    <th className="text-end py-2" style={{ width: "15%" }}>Total GP Amount</th>
                                                    <th className="text-end py-2" style={{ width: "10%" }}>GP %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.length > 0 ? (
                                                    reportData.map((itemGroup, itemIndex) => {
                                                        const totalInfo = itemGroup.total || {};
                                                        return (
                                                            <tr key={itemIndex} className="invoice-item-row">
                                                                <td className="text-start py-2">{itemGroup.item_name || "Unnamed Item"}</td>
                                                                <td className="text-end py-2">{(parseFloat(totalInfo.qty) || 0).toFixed(4)}</td>
                                                                <td className="text-end py-2">{formatCurrency(totalInfo.total_cost, totalInfo.final_base_currency || itemGroup.final_base_currency || itemGroup.rows?.[0]?.final_base_currency)}</td>
                                                                <td className="text-end py-2">{formatCurrency(totalInfo.total_selling, totalInfo.final_base_currency || itemGroup.final_base_currency || itemGroup.rows?.[0]?.final_base_currency)}</td>
                                                                <td className="text-end py-2">{formatCurrency(totalInfo.gp_amount, totalInfo.final_base_currency || itemGroup.final_base_currency || itemGroup.rows?.[0]?.final_base_currency)}</td>
                                                                <td className="text-end py-2">{parseFloat(totalInfo.gp_percent || 0).toFixed(2)}%</td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center text-muted py-4">
                                                            No data available for the selected filters.
                                                        </td>
                                                    </tr>
                                                )}

                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted mb-0">Please use the filter card to search for sales by item.</p>
                            </div>
                        )}
                    </div>
                </div>
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
                 .report-table tr.grand-total-row td {
                     font-weight: bold;
                     padding-top: 6px;
                     padding-bottom: 6px;
                     border-bottom: 4px double #000000 !important;
                     border-top: 1.5px solid #000000 !important;
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
            )}
        </>
    );
};

export default SalesByItemReport;