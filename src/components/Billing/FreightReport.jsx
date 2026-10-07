import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const FreightReport = () => {
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
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Report data states
    const [reportData, setReportData] = useState([]);
    const [loader, setLoader] = useState(true);
    const [searched, setSearched] = useState(false);

    const getStatusCode = (statusStr) => {
        if (statusStr === "Estimated") return "4";
        if (statusStr === "Declined") return "2";
        if (statusStr === "Accepted") return "1";
        if (statusStr === "Pending") return "0";
        return "";
    };

    const getStatusLabel = (statusVal, item = {}) => {
        const raw = item["Status"] !== undefined && item["Status"] !== null && item["Status"] !== ""
            ? item["Status"]
            : (item.status !== undefined && item.status !== null && item.status !== "" ? item.status : statusVal);

        if (raw === undefined || raw === null || raw === "") return "Pending";
        const s = String(raw).trim().toLowerCase();
        if (s === "4" || s === "estimated" || s === "estimate") return "Estimated";
        if (s === "2" || s === "declined" || s === "decline") return "Declined";
        if (s === "1" || s === "accepted" || s === "accept") return "Accepted";
        if (s === "0" || s === "pending") return "Pending";
        if (item.quote_received === "1" || item.quote_received === 1) return "Estimated";
        if (item.client_quoted === "1" || item.client_quoted === 1) return "Accepted";
        return String(raw).charAt(0).toUpperCase() + String(raw).slice(1);
    };

    const getStatusBadgeClass = (statusLabel) => {
        switch (statusLabel) {
            case "Estimated":
                return "bg-info text-white";
            case "Declined":
                return "bg-danger text-white";
            case "Accepted":
                return "bg-success text-white";
            case "Pending":
                return "bg-warning text-dark";
            default:
                return "bg-secondary text-white";
        }
    };

    const handleReset = () => {
        const defStart = getDefaultStartDate();
        const defEnd = getDefaultEndDate();
        setStartDate(defStart);
        setEndDate(defEnd);
        setStatusFilter("ALL");
        fetchReportData(defStart, defEnd, "ALL");
    };

    const handlePrint = () => {
        window.print();
    };

    const handleFilterSubmit = (e) => {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        fetchReportData(startDate, endDate, statusFilter);
    };

    const getNormalizedDate = (item) => {
        const rawDate = item["Date"] || item.Date || item.freight_created_at || item.date || item.created_at;
        if (!rawDate) return "";
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
        optStatus = statusFilter
    ) => {
        setLoader(true);
        setSearched(true);
        try {
            const statusCode = getStatusCode(optStatus);
            const payload = {
                startDate: optStartDate || "",
                endDate: optEndDate || "",
                start_date: optStartDate || "",
                end_date: optEndDate || "",
                format: "json",
            };

            if (optStatus && optStatus !== "ALL") {
                payload.status = statusCode !== "" ? statusCode : optStatus;
                payload.status_name = optStatus;
            }

            let response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}exportFreightAdminReport`,
                payload
            );

            let list = [];
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                list = response.data.data;
            } else if (response.data && Array.isArray(response.data)) {
                list = response.data;
            }

            // Fallback: If backend returns 0 records when filtering by status (due to backend query mismatch), fetch all and filter on client
            if (list.length === 0 && optStatus && optStatus !== "ALL") {
                try {
                    const fallbackPayload = {
                        startDate: optStartDate || "",
                        endDate: optEndDate || "",
                        start_date: optStartDate || "",
                        end_date: optEndDate || "",
                        format: "json",
                    };
                    const fallbackRes = await axios.post(
                        `${process.env.REACT_APP_BASE_URL}exportFreightAdminReport`,
                        fallbackPayload
                    );
                    if (fallbackRes.data && fallbackRes.data.data && Array.isArray(fallbackRes.data.data)) {
                        list = fallbackRes.data.data;
                    } else if (fallbackRes.data && Array.isArray(fallbackRes.data)) {
                        list = fallbackRes.data;
                    }
                } catch (fbErr) {
                    console.warn("Fallback fetch warning:", fbErr);
                }
            }

            // Client-side status filtering if selected
            if (optStatus && optStatus !== "ALL") {
                list = list.filter((item) => {
                    const itemLabel = getStatusLabel(item["Status"], item);
                    return itemLabel.toLowerCase() === optStatus.toLowerCase();
                });
            }

            setReportData(list);
        } catch (error) {
            console.error("Error fetching freight report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch freight report data");
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
                route_url: "/freight-list",
                user_type: usertype,
            };
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                postdata
            );
            if ((response.data && response.data.success === true) || usertype === "1" || usertype === 1 || String(usertype).toLowerCase() === "admin") {
                setHasPermission(true);
                await fetchReportData(startDate, endDate, statusFilter);
            } else {
                setHasPermission(false);
                setLoader(false);
                toast.error("You don't have permission to access this page");
            }
        } catch (error) {
            if (usertype === "1" || usertype === 1 || String(usertype).toLowerCase() === "admin") {
                setHasPermission(true);
                await fetchReportData(startDate, endDate, statusFilter);
            } else {
                setHasPermission(false);
                setLoader(false);
                toast.error(error.response?.data?.message || "You don't have permission to access this page");
            }
        }
    };

    useEffect(() => {
        checkPermission();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDateString = (dateVal) => {
        if (!dateVal || dateVal === "0000-00-00" || dateVal === "0000-00-00 00:00:00") return "-";
        if (typeof dateVal === "string" && /^\d{4}-\d{2}-\d{2}/.test(dateVal.trim())) {
            const [yyyy, mm, dd] = dateVal.trim().substring(0, 10).split("-");
            return `${dd}/${mm}/${yyyy}`;
        }
        const date = new Date(dateVal);
        if (Number.isNaN(date.getTime())) return "-";
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
                                <h4 className="freight_hd">Freight by Admin Report</h4>
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
                                    <form onSubmit={handleFilterSubmit} className="row g-2 align-items-end">
                                        <div className="col-lg-4 col-md-5 col-sm-6">
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

                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Status
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={statusFilter}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setStatusFilter(val);
                                                    fetchReportData(startDate, endDate, val);
                                                }}
                                            >
                                                <option value="ALL">All Statuses</option>
                                                <option value="Estimated">Estimated</option>
                                                <option value="Declined">Declined</option>
                                                <option value="Accepted">Accepted</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-2 col-md-3 col-sm-6 d-flex gap-1">
                                            <button type="submit" className="btn btn-primary blueBtn btn-sm w-50">
                                                Filter
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary btn-sm w-50" onClick={handleReset}>
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
                                                    <h3 className="report-title mb-1 fw-bold text-dark">Freight by Admin Report</h3>
                                                    <h5 className="report-subtitle mb-0 fw-bold text-secondary">Asia Direct - Africa (Pty) Ltd</h5>
                                                    <p className="text-muted small mb-0 mt-1">
                                                        International Freight Forwarding & Logistics Management
                                                    </p>
                                                </div>
                                                <div className="text-end">
                                                    <p className="mb-0 fw-bold text-dark small">Generated: {formatDateString(new Date())}</p>
                                                    <p className="text-muted small mb-0">Total Inquiries: <span className="fw-bold text-dark">{reportData.length}</span></p>
                                                </div>
                                            </div>

                                            <div className="report-meta-info mt-3 p-2 bg-light rounded">
                                                <div className="row g-2">
                                                    <div className="col-md-6 col-6">
                                                        <span className="fw-bold text-dark me-1">Date Range:</span>
                                                        <span className="text-secondary">{startDate && endDate ? `${formatDateString(startDate)} - ${formatDateString(endDate)}` : "All Dates"}</span>
                                                    </div>
                                                    <div className="col-md-6 col-6">
                                                        <span className="fw-bold text-dark me-1">Status:</span>
                                                        <span className="text-secondary">{statusFilter}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Report Table */}
                                        <div className="table-responsive mt-3">
                                            <table className="table table-bordered report-table">
                                                <thead>
                                                    <tr className="header-top-row">
                                                        <th className="text-start text-nowrap">Date</th>
                                                        <th className="text-start text-nowrap">Freight No.</th>
                                                        <th className="text-start">Client Name</th>
                                                        <th className="text-start">Commodity / Description</th>
                                                        <th className="text-start text-nowrap">Freight</th>
                                                        <th className="text-start">Origin &rarr; Destination</th>
                                                        <th className="text-start text-nowrap">Terms</th>
                                                        <th className="text-end text-nowrap">Weight (kg)</th>
                                                        <th className="text-end text-nowrap">Dims (cbm)</th>
                                                        <th className="text-center text-nowrap">Hazardous</th>
                                                        <th className="text-start text-nowrap">Sales Rep</th>
                                                        <th className="text-center text-nowrap">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.length > 0 ? (
                                                        reportData.map((item, index) => {
                                                            const itemDate = formatDateString(item["Date"] || item.Date || item.freight_created_at || item.date || item.created_at);
                                                            const freightNo = item["Freight Number"] || item.freight_number || item.freight_no || (item.freight_id ? `FR000${item.freight_id}` : "-");
                                                            const clientName = item["Client Name"] || item.client_name || item.client_ref_name || "-";
                                                            const commodity = item["Commodity"] || item.commodity || "";
                                                            const goodsDesc = item["Goods description"] || item.product_desc || item.goods_description || "";
                                                            const freightMode = item["Freight"] || item.freightType || item.freight_type || item.freight || "Air";
                                                            const freightType = item["Type"] || item.freightSpeed || item.type || "";
                                                            const origin = item["Origin"] || item.collection_from_name || item.origin || item.port_of_loading || "-";
                                                            const destination = item["Destination"] || item.delivery_to_name || item.destination || item.place_of_delivery || "-";
                                                            const terms = item["Terms"] || item.incoterm || item.terms || "-";
                                                            const weight = item["Weight (Kgs)"] !== undefined ? item["Weight (Kgs)"] : item.weight;
                                                            const dims = item["Dims (Cbm)"] !== undefined ? item["Dims (Cbm)"] : (item.dimension || item.volumetric_weight);
                                                            const hazardous = item["Hazardous"] || item.nature_of_hazard || item.hazardous || "no";
                                                            const salesRep = item["Sales rep"] || item.sales_representative || item.sales_name || "-";
                                                            const statusText = getStatusLabel(item["Status"] !== undefined ? item["Status"] : item.status, item);
                                                            const statusBadgeClass = getStatusBadgeClass(statusText);

                                                            return (
                                                                <tr key={index} className="invoice-item-row">
                                                                    <td className="text-start text-nowrap">{itemDate}</td>
                                                                    <td className="text-start fw-semibold text-primary text-nowrap">{freightNo}</td>
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
                                                                            {freightMode} {freightType ? `(${freightType})` : ""}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-start small">
                                                                        <span>{origin}</span> &rarr; <span>{destination}</span>
                                                                    </td>
                                                                    <td className="text-start text-nowrap">{terms}</td>
                                                                    <td className="text-end text-nowrap">{weight !== undefined && weight !== null && weight !== "" ? formatNumber(weight, 0) : "-"}</td>
                                                                    <td className="text-end text-nowrap">{dims !== undefined && dims !== null && dims !== "" ? formatNumber(dims, 2) : "-"}</td>
                                                                    <td className="text-center text-nowrap">
                                                                        <span className="badge bg-light text-dark border">
                                                                            {hazardous}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-start small text-nowrap">{salesRep}</td>
                                                                    <td className="text-center text-nowrap">
                                                                        <span className={`badge ${statusBadgeClass}`}>
                                                                            {statusText}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="12" className="text-center text-muted py-4">
                                                                No freight inquiries found for the selected criteria.
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

export default FreightReport;
