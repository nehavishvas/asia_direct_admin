import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const ShipmentsReport = () => {
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

    // Filter States
    const [startDate, setStartDate] = useState(location.state?.startDate || getDefaultStartDate());
    const [endDate, setEndDate] = useState(location.state?.endDate || getDefaultEndDate());
    const [shipmentType, setShipmentType] = useState(location.state?.type || "ALL");
    const [freight, setFreight] = useState(location.state?.freight || "ALL");
    const [origin, setOrigin] = useState(location.state?.origin || "");
    const [destination, setDestination] = useState(location.state?.destination || "");
    const [searchQuery, setSearchQuery] = useState(location.state?.search || "");
    const [countries, setCountries] = useState([]);

    // Report data states
    const [reportData, setReportData] = useState([]);
    const [loader, setLoader] = useState(true);
    const [searched, setSearched] = useState(false);

    const fetchCountries = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}GetCountries`);
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setCountries(response.data.data);
            } else if (response.data && Array.isArray(response.data)) {
                setCountries(response.data);
            }
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    };

    const handleReset = () => {
        const defStart = getDefaultStartDate();
        const defEnd = getDefaultEndDate();
        setStartDate(defStart);
        setEndDate(defEnd);
        setShipmentType("ALL");
        setFreight("ALL");
        setOrigin("");
        setDestination("");
        setSearchQuery("");
        fetchReportData(defStart, defEnd, "ALL", "", "ALL", "", "");
    };

    const handlePrint = () => {
        window.print();
    };

    const handleFilterSubmit = (e) => {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        fetchReportData(startDate, endDate, shipmentType, searchQuery, freight, origin, destination);
    };

    const getNormalizedDate = (item) => {
        const rawDate = item["ETA"] || item.ETA || item.etd || item.atd || item.created_at || item.date;
        if (!rawDate || rawDate === "-") return "";
        if (typeof rawDate === "string") {
            const trimmed = rawDate.trim();
            if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
                return trimmed.substring(0, 10);
            }
            if (/^\d{2}[/-]\d{2}[/-]\d{4}/.test(trimmed)) {
                const parts = trimmed.substring(0, 10).split(/[/-]/);
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
            return formatDateToYYYYMMDD(d);
        }
        return "";
    };

    // Fetch report data
    const fetchReportData = async (
        optStartDate = startDate,
        optEndDate = endDate,
        optType = shipmentType,
        optSearch = searchQuery,
        optFreight = freight,
        optOrigin = origin,
        optDestination = destination
    ) => {
        setLoader(true);
        setSearched(true);
        try {
            const payload = {
                search: optSearch || "",
                type: optType && optType !== "ALL" ? optType : "",
                start_date: optStartDate || "",
                end_date: optEndDate || "",
                startDate: optStartDate || "",
                endDate: optEndDate || "",
                freight: optFreight && optFreight !== "ALL" ? optFreight : "",
                origin: optOrigin || "",
                destination: optDestination || "",
                format: "json",
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}exportShipmentReport`,
                payload
            );

            let list = [];
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                list = response.data.data;
            } else if (response.data && Array.isArray(response.data)) {
                list = response.data;
            }

            setReportData(list);
        } catch (error) {
            console.error("Error fetching shipments report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch shipments report data");
            setReportData([]);
        } finally {
            setLoader(false);
        }
    };

    const checkPermission = async () => {
        try {
            if (!userid || !usertype) {
                setHasPermission(false);
                setLoader(false);
                return;
            }
            const postdata = {
                staff_id: userid,
                route_url: "/Admin/manage-shipment",
                user_type: usertype,
            };
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                postdata
            );
            if ((response.data && response.data.success === true) || usertype === "1" || usertype === 1 || String(usertype).toLowerCase() === "admin") {
                setHasPermission(true);
                fetchCountries();
                await fetchReportData(startDate, endDate, shipmentType, searchQuery, freight, origin, destination);
            } else {
                setHasPermission(false);
                setLoader(false);
                toast.error("You don't have permission to access this page");
            }
        } catch (error) {
            if (usertype === "1" || usertype === 1 || String(usertype).toLowerCase() === "admin") {
                setHasPermission(true);
                fetchCountries();
                await fetchReportData(startDate, endDate, shipmentType, searchQuery, freight, origin, destination);
            } else {
                setHasPermission(false);
                setLoader(false);
                toast.error(error.response?.data?.message || "You don't have permission to access this page");
            }
        }
    };

    useEffect(() => {
        fetchCountries();
        checkPermission();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDateString = (dateVal) => {
        if (!dateVal || dateVal === "0000-00-00" || dateVal === "0000-00-00 00:00:00" || dateVal === "-") return "-";
        if (typeof dateVal === "string") {
            const trimmed = dateVal.trim();
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
                return trimmed;
            }
            if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
                const [yyyy, mm, dd] = trimmed.substring(0, 10).split("-");
                return `${dd}/${mm}/${yyyy}`;
            }
        }
        const date = new Date(dateVal);
        if (Number.isNaN(date.getTime())) return typeof dateVal === "string" ? dateVal : "-";
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const formatNumber = (num, decimals = 2) => {
        const val = parseFloat(num);
        if (isNaN(val)) return decimals === 0 ? "0" : "0.00";
        return val.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    const getStatusBadgeClass = (statusLabel) => {
        if (!statusLabel) return "bg-secondary text-white";
        const s = String(statusLabel).toLowerCase();
        if (s.includes("released") || s.includes("delivered") || s.includes("completed")) {
            return "bg-success text-white";
        }
        if (s.includes("transit") || s.includes("active") || s.includes("on water")) {
            return "bg-info text-white";
        }
        if (s.includes("custom") || s.includes("hold") || s.includes("pending")) {
            return "bg-warning text-dark";
        }
        return "bg-primary text-white";
    };

    return (
        <>
            {loader && hasPermission === null ? (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p className="loader-text">Loading...</p>
                </div>
            ) : hasPermission === false ? (
                <div className="wpWrapper">
                    <div className="container-fluid no-print">
                        <div className="row manageFreight">
                            <div className="col-12">
                                <h4 className="freight_hd">Shipments Report</h4>
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
                                    <PrintIcon /> Print Report / PDF
                                </button>
                            </div>

                            {/* Filter Card */}
                            <div className="card shadow-sm border-0 mb-4 bg-light">
                                <div className="card-body">
                                    <form onSubmit={handleFilterSubmit}>
                                        <div className="row g-2 align-items-end">
                                            {/* Date Range */}
                                            <div className="col-lg-4 col-md-6 col-sm-12">
                                                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                    Date Range
                                                </label>
                                                <div className="d-flex gap-1">
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        title="Start Date"
                                                    />
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        title="End Date"
                                                    />
                                                </div>
                                            </div>

                                            {/* Shipment Type */}
                                            <div className="col-lg-2 col-md-3 col-sm-6">
                                                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                    Shipment Type
                                                </label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={shipmentType}
                                                    onChange={(e) => setShipmentType(e.target.value)}
                                                >
                                                    <option value="ALL">All Shipments</option>
                                                    <option value="active">Active Shipments</option>
                                                    <option value="released">Customs Released</option>
                                                </select>
                                            </div>

                                            {/* Freight */}
                                            <div className="col-lg-2 col-md-3 col-sm-6">
                                                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                    Freight Mode
                                                </label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={freight}
                                                    onChange={(e) => setFreight(e.target.value)}
                                                >
                                                    <option value="ALL">All Freight</option>
                                                    <option value="Sea">Sea</option>
                                                    <option value="Air">Air</option>
                                                    <option value="Road">Road</option>
                                                </select>
                                            </div>

                                            {/* Origin Country */}
                                            <div className="col-lg-2 col-md-6 col-sm-6">
                                                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                    Origin Country
                                                </label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={origin}
                                                    onChange={(e) => setOrigin(e.target.value)}
                                                >
                                                    <option value="">All Origins</option>
                                                    {countries && countries.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Destination Country */}
                                            <div className="col-lg-2 col-md-6 col-sm-6">
                                                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                    Destination Country
                                                </label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={destination}
                                                    onChange={(e) => setDestination(e.target.value)}
                                                >
                                                    <option value="">All Destinations</option>
                                                    {countries && countries.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Search */}
                                            <div className="col-lg-9 col-md-8 col-sm-12">
                                                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                    Search
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Search by bill number, container, client, commodity, type..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="col-lg-3 col-md-4 col-sm-12 d-flex gap-2">
                                                <button type="submit" className="btn btn-primary blueBtn btn-sm flex-grow-1">
                                                    Filter
                                                </button>
                                                <button type="button" className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={handleReset}>
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Report Printable Area */}
                        <div className="card shadow-sm border-0 report-print-area">
                            <div className="card-body p-4 p-md-5">
                                {loader ? (
                                    <div className="loader-container" style={{ height: "40vh", background: "transparent" }}>
                                        <div className="loader"></div>
                                        <p className="loader-text">Loading report data...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Report Header */}
                                        <div className="report-header mb-4 text-start">
                                            <div className="d-flex justify-content-between align-items-start border-bottom pb-3">
                                                <div>
                                                    <h3 className="report-title mb-1 fw-bold text-dark">Shipments Report</h3>
                                                    <h5 className="report-subtitle mb-0 fw-bold text-secondary">Asia Direct - Africa (Pty) Ltd</h5>
                                                    <p className="text-muted small mb-0 mt-1">
                                                        Master Tracking, POL & POD Transit Management
                                                    </p>
                                                </div>
                                                <div className="text-end">
                                                    <p className="mb-0 fw-bold text-dark small">Generated: {formatDateString(new Date())}</p>
                                                    <p className="text-muted small mb-0">Total Shipments: <span className="fw-bold text-dark">{reportData.length}</span></p>
                                                </div>
                                            </div>

                                            <div className="report-meta-info mt-3 p-2 bg-light rounded">
                                                <div className="row g-2">
                                                    <div className="col-md-6">
                                                        <span className="fw-bold text-dark me-1">Date Range:</span>
                                                        <span className="text-secondary">{startDate && endDate ? `${formatDateString(startDate)} - ${formatDateString(endDate)}` : "All Dates"}</span>
                                                    </div>
                                                    <div className="col-md-6 text-md-end">
                                                        <span className="fw-bold text-dark me-1">Filters:</span>
                                                        <span className="text-secondary">
                                                            {shipmentType === "active" ? "Active Shipments" : shipmentType === "released" ? "Customs Released" : "All Types"}
                                                            {freight && freight !== "ALL" ? ` | Freight: ${freight}` : ""}
                                                            {origin ? ` | Origin: ${countries.find((c) => String(c.id) === String(origin) || c.name === origin)?.name || origin}` : ""}
                                                            {destination ? ` | Dest: ${countries.find((c) => String(c.id) === String(destination) || c.name === destination)?.name || destination}` : ""}
                                                            {searchQuery ? ` | Search: "${searchQuery}"` : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Report Table */}
                                        <div className="table-responsive mt-3">
                                            <table className="table table-bordered report-table">
                                                <thead>
                                                    <tr className="header-top-row">
                                                        <th className="text-start text-nowrap">Bill Number</th>
                                                        <th className="text-start text-nowrap">Type</th>
                                                        <th className="text-start text-nowrap">Container #</th>
                                                        <th className="text-start text-nowrap">Carrier</th>
                                                        <th className="text-start">Client Name</th>
                                                        <th className="text-start">Commodity / Description</th>
                                                        <th className="text-start text-nowrap">Freight</th>
                                                        <th className="text-start">Origin &rarr; Destination</th>
                                                        <th className="text-start text-nowrap">ETA</th>
                                                        <th className="text-end text-nowrap">Weight (kg)</th>
                                                        <th className="text-end text-nowrap">Dims (cbm)</th>
                                                        <th className="text-center text-nowrap">Hazardous</th>
                                                        <th className="text-center text-nowrap">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.length > 0 ? (
                                                        reportData.map((item, index) => {
                                                            const billNo = item["Bill Number"] || item.bill_number || item.waybill || "-";
                                                            const typeVal = item["Type"] || item.type || item.order_number || item.freight_number || item.clearance_number || "-";
                                                            const containerNo = item["Container #"] || item.container_number || item.container_no || "-";
                                                            const carrier = item["Carrier"] || item.carrier || item.vessel || "-";
                                                            const clientName = item["Client Name"] || item.client_name || "-";
                                                            const commodity = item["Commodity"] || item.commodity || "";
                                                            const goodsDesc = item["Goods description"] || item.goods_description || item.product_desc || "";
                                                            const freightMode = item["Freight"] || item.freight || "Sea";
                                                            const rowOrigin = item["Origin"] || item.origin || item.port_of_loading || "-";
                                                            const rowDestination = item["Destination"] || item.destination || item.port_of_discharge || "-";
                                                            const eta = formatDateString(item["ETA"] || item.ETA || item.atd || item.etd);
                                                            const weight = item["Weight (Kgs)"] !== undefined ? item["Weight (Kgs)"] : item.weight;
                                                            const dims = item["Dims (Cbm)"] !== undefined ? item["Dims (Cbm)"] : (item.dimension || item.volumetric_weight);
                                                            const hazardous = item["Hazardous"] || item.hazardous || "NO";
                                                            const status = item["Status"] || item.status || "Active";
                                                            const statusBadgeClass = getStatusBadgeClass(status);

                                                            return (
                                                                <tr key={index} className="invoice-item-row">
                                                                    <td className="text-start fw-semibold text-primary text-nowrap">{billNo}</td>
                                                                    <td className="text-start text-nowrap fw-medium text-dark">{typeVal}</td>
                                                                    <td className="text-start fw-medium text-nowrap">{containerNo}</td>
                                                                    <td className="text-start text-nowrap">{carrier}</td>
                                                                    <td className="text-start fw-medium">{clientName}</td>
                                                                    <td className="text-start">
                                                                        {commodity && <div className="fw-semibold text-dark">{commodity}</div>}
                                                                        {goodsDesc && goodsDesc !== commodity && (
                                                                            <div className="text-muted small" style={{ fontSize: "11px" }}>{goodsDesc}</div>
                                                                        )}
                                                                        {!commodity && !goodsDesc && "-"}
                                                                    </td>
                                                                    <td className="text-start text-nowrap">
                                                                        <span className="badge bg-light text-dark border">
                                                                            {freightMode}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-start small">
                                                                        <span>{rowOrigin}</span> &rarr; <span>{rowDestination}</span>
                                                                    </td>
                                                                    <td className="text-start text-nowrap">{eta}</td>
                                                                    <td className="text-end text-nowrap">{weight !== undefined && weight !== null && weight !== "" && weight !== "-" ? formatNumber(weight, 1) : "-"}</td>
                                                                    <td className="text-end text-nowrap">{dims !== undefined && dims !== null && dims !== "" && dims !== "-" ? formatNumber(dims, 2) : "-"}</td>
                                                                    <td className="text-center text-nowrap">
                                                                        <span className="badge bg-light text-dark border">
                                                                            {hazardous}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-center text-nowrap">
                                                                        <span className={`badge ${statusBadgeClass}`}>
                                                                            {status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="13" className="text-center text-muted py-4">
                                                                No shipments found for the selected criteria.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <style type="text/css">{`
                        .report-title {
                            font-size: 18px !important;
                            color: #1b2245 !important;
                        }
                        .report-subtitle {
                            font-size: 14px !important;
                        }
                        .report-meta-info {
                            font-size: 12px !important;
                        }
                        .report-table {
                            width: 100%;
                            min-width: 1100px;
                            border-collapse: collapse;
                            margin-top: 15px;
                            background-color: #ffffff;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            font-size: 12px;
                        }
                        .report-table th {
                            background-color: #1b2245;
                            color: #ffffff;
                            padding: 8px 8px;
                            font-weight: 600;
                            border: 1px solid #1b2245;
                            vertical-align: middle;
                        }
                        .report-table td {
                            padding: 6px 8px;
                            border: 1px solid #dee2e6;
                            vertical-align: middle;
                            color: #212529;
                        }
                        .report-table tr:nth-of-type(even) {
                            background-color: #f8f9fa;
                        }
                        @media print {
                            @page {
                                size: landscape;
                                margin: 8mm 6mm;
                            }
                            html, body, #root, #root > div, .App, .admin-layout, .layout-main, .main-content, .wpWrapper, .report-wrapper {
                                display: block !important;
                                height: auto !important;
                                min-height: auto !important;
                                overflow: visible !important;
                                overflow-y: visible !important;
                                position: static !important;
                                padding: 0 !important;
                                margin: 0 !important;
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
                                min-width: 0 !important;
                                max-width: 100% !important;
                                border-collapse: collapse !important;
                                display: table !important;
                                margin-top: 15px !important;
                                break-inside: auto !important;
                                page-break-inside: auto !important;
                                font-size: 8.5px !important;
                                table-layout: auto !important;
                            }
                            .report-table thead {
                                display: table-header-group !important;
                            }
                            .report-table tbody {
                                display: table-row-group !important;
                            }
                            .report-table th {
                                background-color: #1b2245 !important;
                                color: #ffffff !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                                padding: 4px 3px !important;
                                border: 1px solid #1b2245 !important;
                                font-size: 8.5px !important;
                                white-space: nowrap !important;
                            }
                            .report-table td {
                                padding: 3px 3px !important;
                                border: 1px solid #dee2e6 !important;
                                font-size: 8.5px !important;
                                line-height: 1.2 !important;
                            }
                            .badge {
                                border: none !important;
                                background: none !important;
                                color: #000 !important;
                                padding: 0 !important;
                                font-size: 8.5px !important;
                                font-weight: 600 !important;
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

export default ShipmentsReport;
