import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const SupplierWarehouseDaysOutstandingReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
    const userid = userdata?.id;
    const usertype = userdata?.user_type;
    const [hasPermission, setHasPermission] = useState(null);

    // Default to today's date
    const getTodayDateString = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    // Filter states
    const [runAtDate, setRunAtDate] = useState(location.state?.runAtDate || getTodayDateString());
    const [supplierFrom, setSupplierFrom] = useState(location.state?.supplierFrom || "");
    const [supplierTo, setSupplierTo] = useState(location.state?.supplierTo || "");

    const [suppliers, setSuppliers] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);

    // Fetch suppliers list
    const fetchSuppliers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}supplier-list`);
            if (response.data && response.data.data) {
                setSuppliers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching suppliers:", error);
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
                route_url: "/GetSupplierCreatedWarehouseOrders",
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
        fetchSuppliers();
        checkPermission();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch report data from API
    const fetchReportData = async (
        e,
        optRunAtDate = runAtDate,
        optSupplierFrom = supplierFrom,
        optSupplierTo = supplierTo
    ) => {
        if (e) e.preventDefault();
        setLoader(true);
        setSearched(true);
        try {
            const payload = {
                run_at_date: optRunAtDate || getTodayDateString(),
                supplier_from: optSupplierFrom ? optSupplierFrom : null,
                supplier_to: optSupplierTo ? optSupplierTo : null,
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getSupplierWarehouseDaysOutstandingReport`,
                payload
            );

            if (response.data && response.data.success) {
                setReportData(response.data.data || []);
            } else {
                setReportData([]);
                toast.error(response.data?.message || "No data found");
            }
        } catch (error) {
            console.error("Error fetching supplier warehouse days outstanding report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
            setReportData([]);
        } finally {
            setLoader(false);
        }
    };

    const handleReset = () => {
        const today = getTodayDateString();
        setRunAtDate(today);
        setSupplierFrom("");
        setSupplierTo("");
        fetchReportData(null, today, "", "");
    };

    const handlePrint = () => {
        window.print();
    };

    const formatNumber = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return "0";
        return num.toLocaleString("en-US");
    };

    const formatDateString = (dateVal) => {
        if (!dateVal) return "-";
        const date = new Date(dateVal);
        if (Number.isNaN(date.getTime())) return String(dateVal);
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const getSupplierFilterText = () => {
        if (!supplierFrom && !supplierTo) return "All Suppliers";
        if (supplierFrom === supplierTo) return supplierFrom;
        return `${supplierFrom || "Start"} to ${supplierTo || "End"}`;
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
                                <h4 className="freight_hd">Supplier Warehouse Days Outstanding Report</h4>
                                <div className="line"></div>
                            </div>
                        </div>
                        <div className="text-center mt-5">
                            <h3 className="text-danger">You don't have permission to access this page</h3>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="wpWrapper report-wrapper">
                    <div className="container-fluid no-print">
                        {/* Top Bar */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-secondary d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
                                    <ArrowBackIcon /> Back
                                </button>
                                <h4 className="freight_hd mb-0 ms-2" style={{ fontSize: "1.25rem" }}>
                                    Supplier Warehouse Days Outstanding Report
                                </h4>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                {searched && reportData.length > 0 && (
                                    <button
                                        className="btn btn-primary d-flex align-items-center gap-2 blueBtn btn-sm"
                                        onClick={handlePrint}
                                    >
                                        <PrintIcon fontSize="small" /> Print Report
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Card */}
                        <div className="card shadow-sm border-0 mb-4 bg-light">
                            <div className="card-body">
                                <form onSubmit={fetchReportData} className="row g-2 justify-content-center align-items-end">
                                    {/* Run At Date */}
                                    <div className="col-lg-3 col-md-4 col-sm-6">
                                        <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                            Run At Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={runAtDate}
                                            onChange={(e) => setRunAtDate(e.target.value)}
                                        />
                                    </div>

                                    {/* Supplier Range */}
                                    <div className="col-lg-6 col-md-5 col-sm-6">
                                        <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                            Supplier
                                        </label>
                                        <div className="d-flex gap-1">
                                            <select
                                                className="form-select form-select-sm"
                                                value={supplierFrom}
                                                onChange={(e) => setSupplierFrom(e.target.value)}
                                            >
                                                <option value="">(From)</option>
                                                {suppliers &&
                                                    suppliers.map((item) => (
                                                        <option key={item.id} value={item.name}>
                                                            {item.name}
                                                        </option>
                                                    ))}
                                            </select>
                                            <select
                                                className="form-select form-select-sm"
                                                value={supplierTo}
                                                onChange={(e) => setSupplierTo(e.target.value)}
                                            >
                                                <option value="">(To)</option>
                                                {suppliers &&
                                                    suppliers.map((item) => (
                                                        <option key={item.id} value={item.name}>
                                                            {item.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="col-lg-3 col-md-3 col-sm-6 d-flex align-items-center gap-2">
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
                                            <h4 className="report-title mb-1 fw-bold text-dark">
                                                Supplier Warehouse Days Outstanding Report
                                            </h4>
                                            <h6 className="report-subtitle mb-4 fw-bold text-secondary">
                                                Asia Direct Africa
                                            </h6>

                                            <div className="report-meta-info mt-3">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>
                                                                Supplier:
                                                            </span>
                                                            <span className="text-secondary">{getSupplierFilterText()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>
                                                                Run Date:
                                                            </span>
                                                            <span className="text-secondary">{formatDateString(runAtDate)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Report Table with Dark Blue Header */}
                                        <div className="table-responsive mt-4">
                                            <table className="table report-table">
                                                <thead>
                                                    <tr>
                                                        <th className="text-start">Supplier</th>
                                                        <th className="text-end" style={{ width: "110px" }}>Total Orders</th>
                                                        <th className="text-end" style={{ width: "110px" }}>120+ Days</th>
                                                        <th className="text-end" style={{ width: "110px" }}>90 Days</th>
                                                        <th className="text-end" style={{ width: "110px" }}>60 Days</th>
                                                        <th className="text-end" style={{ width: "110px" }}>30 Days</th>
                                                        <th className="text-end" style={{ width: "110px" }}>Current</th>
                                                        <th className="text-end" style={{ width: "130px" }}>Total Stored</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="text-start">
                                                                {(item.supplier_name || item.name || "").trim() || "Unknown Supplier"}
                                                            </td>
                                                            <td className="text-end">{formatNumber(item.total_orders ?? 0)}</td>
                                                            <td className="text-end">{formatNumber(item.days_120 ?? item.days120 ?? 0)}</td>
                                                            <td className="text-end">{formatNumber(item.days_90 ?? item.days90 ?? 0)}</td>
                                                            <td className="text-end">{formatNumber(item.days_60 ?? item.days60 ?? 0)}</td>
                                                            <td className="text-end">{formatNumber(item.days_30 ?? item.days30 ?? 0)}</td>
                                                            <td className="text-end">{formatNumber(item.current ?? 0)}</td>
                                                            <td className="text-end fw-bold">{formatNumber(item.total_stored ?? item.total_orders ?? 0)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted mb-0">
                                            No supplier warehouse outstanding records found for the selected filters.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                    border: 1px solid #1b2245 !important;
                }
                .report-table thead tr {
                    background-color: #1b2245 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .report-table thead th {
                    background-color: #1b2245 !important;
                    color: #ffffff !important;
                    font-weight: bold;
                    border: 1px solid #1b2245 !important;
                    border-right: 1px solid rgba(255, 255, 255, 0.25) !important;
                    padding: 10px 12px !important;
                    font-size: 12px !important;
                    letter-spacing: 0.2px;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .report-table tbody td {
                    border: 1px solid #000000 !important;
                    padding: 8px 12px !important;
                    font-size: 12px;
                    color: #000000;
                }
                .report-table tbody tr:hover td {
                    background-color: #f8f9fa;
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
                        border: 1px solid #1b2245 !important;
                    }
                    .report-table thead th {
                        background-color: #1b2245 !important;
                        color: #ffffff !important;
                        border: 1px solid #1b2245 !important;
                        padding: 6px 8px !important;
                        font-size: 11px !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .report-table tbody td {
                        border: 1px solid #000000 !important;
                        padding: 5px 8px !important;
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

export default SupplierWarehouseDaysOutstandingReport;
