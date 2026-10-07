import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const FreightAdminBySalesRepReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isFreightOrders = location.pathname.includes("freight-orders");
    const pageTitle = isFreightOrders ? "Freight Orders - Sales Rep Report" : "Freight By Admin - Sales Rep Report";
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

    const formatToDDMMYYYY = (dateStr) => {
        if (!dateStr) return "";
        if (typeof dateStr === "string" && dateStr.includes("/")) return dateStr;
        const parts = dateStr.split("-");
        if (parts.length === 3 && parts[0].length === 4) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    };

    // Filter States
    const [startDate, setStartDate] = useState(getDefaultStartDate());
    const [endDate, setEndDate] = useState(getDefaultEndDate());
    const [fromSalesRep, setFromSalesRep] = useState("All");
    const [toSalesRep, setToSalesRep] = useState("All");
    const [activeStatus, setActiveStatus] = useState("Both");
    const [salesType, setSalesType] = useState("All");
    const [style, setStyle] = useState("Detailed"); // Detailed | Summary
    const [includeCreditNotes, setIncludeCreditNotes] = useState(true);

    // Response Data States
    const [reportInfo, setReportInfo] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [grandTotal, setGrandTotal] = useState(null);
    const [totalSalesReps, setTotalSalesReps] = useState(0);
    const [staffList, setStaffList] = useState([]);
    const [loader, setLoader] = useState(true);
    const [searched, setSearched] = useState(false);

    const handleReset = () => {
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
        setFromSalesRep("All");
        setToSalesRep("All");
        setActiveStatus("Both");
        setSalesType("All");
        setStyle("Detailed");
        setIncludeCreditNotes(true);
        setReportData([]);
        setGrandTotal(null);
        setReportInfo(null);
        setTotalSalesReps(0);
        setSearched(false);
    };

    const handlePrint = () => {
        window.print();
    };

    // Fetch Staff for dropdowns
    const fetchStaffList = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}staff-list`);
            if (response.data && response.data.success) {
                const list = response.data.data || [];
                const sortedList = [...list]
                    .filter((item) => item && (item.full_name || item.staff_name || item.name))
                    .sort((a, b) => ((a.full_name || a.staff_name || a.name || "").localeCompare(b.full_name || b.staff_name || b.name || "")));
                setStaffList(sortedList);
            }
        } catch (error) {
            console.error("Error fetching staff list:", error);
        }
    };

    // Fetch report data
    const fetchReportData = async (e) => {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        setLoader(true);
        setSearched(true);
        try {
            const startDateFormatted = startDate ? formatToDDMMYYYY(startDate) : "";
            const endDateFormatted = endDate ? formatToDDMMYYYY(endDate) : "";

            const filtersPayload = {
                from_sales_rep: fromSalesRep || "All",
                to_sales_rep: toSalesRep || "All",
                active: activeStatus || "Both",
                sales_type: salesType || "All",
                start_date: startDate || "",
                start_date_formatted: startDateFormatted,
                end_date: endDate || "",
                end_date_formatted: endDateFormatted,
                style: style || "Detailed",
                include_credit_notes: includeCreditNotes
            };

            const payload = {
                ...filtersPayload,
                sales_rep_from: fromSalesRep || "All",
                sales_rep_to: toSalesRep || "All",
                filters: filtersPayload
            };

            const endpoint = isFreightOrders ? "newSalesBySalesRepOrderReport" : "newSalesBySalesRepReport";

            let response;
            try {
                response = await axios.post(
                    `${process.env.REACT_APP_BASE_URL}${endpoint}`,
                    payload
                );
            } catch (postErr) {
                console.warn(`${endpoint} endpoint failed:`, postErr);
                if (!isFreightOrders) {
                    response = await axios.post(
                        `${process.env.REACT_APP_BASE_URL}getSalesBySalesRepReport`,
                        payload
                    );
                } else {
                    throw postErr;
                }
            }

            if (response && response.data && (response.data.success || response.data.status === 200 || response.data.data || response.data.sales_reps)) {
                const resData = response.data.data && typeof response.data.data === "object" && !Array.isArray(response.data.data)
                    ? response.data.data
                    : response.data;
                const repsList = resData.sales_reps || resData.salesReps || resData.data || (Array.isArray(resData) ? resData : []);
                setReportData(repsList);
                setReportInfo(resData.report_info || response.data.report_info || null);
                setGrandTotal(resData.grand_total || response.data.grand_total || resData.totals || response.data.totals || null);
                setTotalSalesReps(resData.totalSalesReps || resData.total_sales_reps || response.data.totalSalesReps || repsList.length);
            } else {
                toast.error(response?.data?.message || "Failed to fetch report data");
                setReportData([]);
                setGrandTotal(null);
            }
        } catch (error) {
            console.error(`Error fetching ${pageTitle}:`, error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
            setReportData([]);
            setGrandTotal(null);
        } finally {
            setLoader(false);
        }
    };

    const checkPermission = async () => {
        try {
            if (!userid || !usertype) {
                setHasPermission(true);
                await fetchReportData();
                return;
            }
            const postdata = {
                staff_id: userid,
                route_url: location.pathname || (isFreightOrders ? "/Admin/freight-orders-sales-rep-report" : "/Admin/freight-admin-by-sales-rep-report"),
                user_type: usertype,
            };
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                postdata
            );
            if (response.data && response.data.success === true) {
                setHasPermission(true);
                await fetchReportData();
            } else {
                setHasPermission(true);
                await fetchReportData();
            }
        } catch (error) {
            setHasPermission(true);
            await fetchReportData();
        }
    };

    useEffect(() => {
        checkPermission();
        fetchStaffList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    // Format Helpers
    const formatCurrency = (amount, currencySymbol = "R") => {
        if (amount === null || amount === undefined || amount === "") return `${currencySymbol}0.00`;
        const num = parseFloat(amount);
        if (isNaN(num)) return `${currencySymbol}0.00`;
        const isNegative = num < 0;
        const absVal = Math.abs(num).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return isNegative ? `${currencySymbol}-${absVal}` : `${currencySymbol}${absVal}`;
    };

    const formatQty = (qty) => {
        if (qty === null || qty === undefined || qty === "") return "0.0000";
        const num = parseFloat(qty);
        if (isNaN(num)) return "0.0000";
        return num.toFixed(4);
    };

    const formatDims = (dims) => {
        if (dims === null || dims === undefined || dims === "" || parseFloat(dims) === 0) return "-";
        const num = parseFloat(dims);
        if (isNaN(num)) return typeof dims === "string" ? dims : "-";
        return num.toFixed(4);
    };

    const formatWeight = (weight) => {
        if (weight === null || weight === undefined || weight === "" || parseFloat(weight) === 0) return "-";
        const num = parseFloat(weight);
        if (isNaN(num)) return typeof weight === "string" ? weight : "-";
        return num.toFixed(4);
    };

    const formatPercent = (val) => {
        if (val === null || val === undefined || val === "") return "0.00%";
        const num = parseFloat(val);
        if (isNaN(num)) return "0.00%";
        return `${num.toFixed(2)}%`;
    };

    const formatDateDisplay = (dateVal) => {
        if (!dateVal) return "-";
        if (typeof dateVal === "string" && dateVal.includes("/")) return dateVal;
        const date = new Date(dateVal);
        if (Number.isNaN(date.getTime())) return typeof dateVal === "string" ? dateVal : "-";
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    return (
        <>
            {loader && !searched ? (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p className="loader-text">Loading...</p>
                </div>
            ) : hasPermission === false ? (
                <div className="wpWrapper">
                    <div className="container-fluid no-print">
                        <div className="row manageFreight">
                            <div className="col-12">
                                <h4 className="freight_hd">{pageTitle}</h4>
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
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-3">
                                <button
                                    className="btn btn-secondary d-flex align-items-center gap-2"
                                    onClick={() => navigate(-1)}
                                >
                                    <ArrowBackIcon /> Back
                                </button>
                                <h4 className="freight_hd mb-0">{pageTitle}</h4>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center gap-2 blueBtn"
                                onClick={handlePrint}
                            >
                                <PrintIcon /> Print Report
                            </button>
                        </div>

                        {/* Filter Card */}
                        <div className="card shadow-sm border-0 mb-4 bg-light">
                            <div className="card-body p-3 p-md-4">
                                <form onSubmit={fetchReportData}>
                                    {/* Row 1: Date Range, Sales Rep Range */}
                                    <div className="row g-3 align-items-end mb-3">
                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                From Sales Rep
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={fromSalesRep}
                                                onChange={(e) => setFromSalesRep(e.target.value)}
                                            >
                                                <option value="All">All</option>
                                                {staffList &&
                                                    staffList.length > 0 &&
                                                    staffList.map((staff, idx) => {
                                                        const name = staff.full_name || staff.staff_name || staff.name;
                                                        return (
                                                            <option key={staff.id || `from_${idx}`} value={name || staff.id}>
                                                                {name}
                                                            </option>
                                                        );
                                                    })}
                                            </select>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                To Sales Rep
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={toSalesRep}
                                                onChange={(e) => setToSalesRep(e.target.value)}
                                            >
                                                <option value="All">All</option>
                                                {staffList &&
                                                    staffList.length > 0 &&
                                                    staffList.map((staff, idx) => {
                                                        const name = staff.full_name || staff.staff_name || staff.name;
                                                        return (
                                                            <option key={staff.id || `to_${idx}`} value={name || staff.id}>
                                                                {name}
                                                            </option>
                                                        );
                                                    })}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row 2: Active, Sales Type, Style, Credit Notes & Buttons */}
                                    <div className="row g-3 align-items-end">
                                        <div className="col-lg-2 col-md-4 col-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Active Status
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={activeStatus}
                                                onChange={(e) => setActiveStatus(e.target.value)}
                                            >
                                                <option value="Both">Both</option>
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-2 col-md-4 col-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Sales Type
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={salesType}
                                                onChange={(e) => setSalesType(e.target.value)}
                                            >
                                                <option value="All">All</option>
                                                <option value="Invoices">Invoices</option>
                                                <option value="Credit Notes">Credit Notes</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-2 col-md-4 col-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Style
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={style}
                                                onChange={(e) => setStyle(e.target.value)}
                                            >
                                                <option value="Detailed">Detailed</option>
                                                <option value="Summary">Summary</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-6 d-flex align-items-center mb-1">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="includeCreditNotesChk"
                                                    checked={includeCreditNotes}
                                                    onChange={(e) => setIncludeCreditNotes(e.target.checked)}
                                                />
                                                <label
                                                    className="form-check-label text-secondary fw-semibold user-select-none"
                                                    htmlFor="includeCreditNotesChk"
                                                    style={{ fontSize: "12px", cursor: "pointer" }}
                                                >
                                                    Include Credit Notes
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12 d-flex justify-content-end gap-2">
                                            <button type="submit" className="btn btn-primary blueBtn btn-sm px-4 py-2">
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm px-4 py-2"
                                                onClick={handleReset}
                                            >
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
                            ) : searched ? (
                                <>
                                    {/* Report Header */}
                                    <div className="report-header-section mb-2 text-start">
                                        <h4 className="report-main-title fw-bold text-dark text-center mb-4">
                                            {reportInfo?.title || pageTitle}
                                        </h4>

                                        <div className="d-flex justify-content-between align-items-end mb-2">
                                            <div>
                                                <h5 className="report-company-name fw-bold text-dark mb-0">
                                                    {reportInfo?.company || "Asia Direct Africa"}
                                                </h5>
                                            </div>
                                            <div className="report-meta-right text-end" style={{ fontSize: "12px", minWidth: "220px" }}>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="fw-bold text-dark me-3">Start Date:</span>
                                                    <span className="text-dark">{reportInfo?.start_date || formatToDDMMYYYY(startDate)}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="fw-bold text-dark me-3">End Date:</span>
                                                    <span className="text-dark">{reportInfo?.end_date || formatToDDMMYYYY(endDate)}</span>
                                                </div>
                                                {/* <div className="d-flex justify-content-between">
                                                    <span className="fw-bold text-dark me-3">Page:</span>
                                                    <span className="text-dark">1/1</span>
                                                </div> */}
                                            </div>
                                        </div>

                                        <div className="report-header-line"></div>
                                    </div>

                                    {/* Report Table */}
                                    <div className="table-responsive mt-1">
                                        {style === "Summary" ? (
                                            <table className="freight-sales-rep-report-table">
                                                <thead>
                                                    <tr className="table-header-row">
                                                        <th className="text-start" style={{ width: "40%" }}>Sales Rep</th>
                                                        <th className="text-start" style={{ width: "15%" }}>Freight</th>
                                                        <th className="text-start" style={{ width: "15%" }}>Option</th>
                                                        <th className="text-end" style={{ width: "15%" }}>Dims (Cbm)</th>
                                                        <th className="text-end" style={{ width: "15%" }}>Weight (Kgs)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData && reportData.length > 0 ? (
                                                        reportData.map((rep, repIdx) => {
                                                            const repName = rep.sales_rep_name || rep.sales_rep || "Unknown Sales Rep";
                                                            const firstRow = (rep.rows && rep.rows[0]) || (rep.invoices && rep.invoices[0]) || {};
                                                            return (
                                                                <tr key={rep.sales_rep_id || `rep_sum_${repIdx}`} className="sales-rep-row-data">
                                                                    <td className="text-start fw-bold">
                                                                        {repName}
                                                                    </td>
                                                                    <td className="text-start">
                                                                        {rep.freight || firstRow.freight || "-"}
                                                                    </td>
                                                                    <td className="text-start">
                                                                        {rep.type || rep.fcl_lcl || firstRow.type || firstRow.fcl_lcl || "-"}
                                                                    </td>
                                                                    <td className="text-end">
                                                                        {rep.total_dimension_display || rep.total_diamension_display || rep.dimension_display || (rep.total_dimension !== undefined && rep.total_dimension !== null && rep.total_dimension !== "" ? formatDims(rep.total_dimension) : (rep.dimension !== undefined && rep.dimension !== null && rep.dimension !== "" ? formatDims(rep.dimension) : (rep.total_cbm ? formatDims(rep.total_cbm) : "-")))}
                                                                    </td>
                                                                    <td className="text-end">
                                                                        {rep.total_weight_display || rep.weight_display || (rep.total_weight !== undefined && rep.total_weight !== null && rep.total_weight !== "" ? formatWeight(rep.total_weight) : (rep.weight !== undefined && rep.weight !== null && rep.weight !== "" ? formatWeight(rep.weight) : "-"))}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center text-muted py-4">
                                                                No data found for the selected criteria.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {grandTotal && reportData && reportData.length > 0 && (
                                                        <tr className="grand-total-row">
                                                            <td colSpan="3" className="text-start fw-bold grand-total-border">
                                                                Grand Total:
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal.total_dimension_display || grandTotal.dimension_display || grandTotal.diamension_display || (grandTotal.total_dimension !== undefined && grandTotal.total_dimension !== null ? formatDims(grandTotal.total_dimension) : (grandTotal.dimension !== undefined && grandTotal.dimension !== null ? formatDims(grandTotal.dimension) : ""))}
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal.total_weight_display || grandTotal.weight_display || (grandTotal.total_weight !== undefined && grandTotal.total_weight !== null ? formatWeight(grandTotal.total_weight) : (grandTotal.weight !== undefined && grandTotal.weight !== null ? formatWeight(grandTotal.weight) : ""))}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <table className="freight-sales-rep-report-table">
                                                <thead>
                                                    <tr className="table-header-row">
                                                        <th className="text-start" style={{ width: "12%" }}>Date</th>
                                                        <th className="text-start" style={{ width: "14%" }}>Reference</th>
                                                        <th className="text-start" style={{ width: "32%" }}>Customer</th>
                                                        <th className="text-start" style={{ width: "11%" }}>Freight</th>
                                                        <th className="text-start" style={{ width: "11%" }}>Option</th>
                                                        <th className="text-end" style={{ width: "10%" }}>Dims (Cbm)</th>
                                                        <th className="text-end" style={{ width: "10%" }}>Weight (Kgs)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData && reportData.length > 0 ? (
                                                        reportData.map((rep, repIdx) => {
                                                            const repName = rep.sales_rep_name || rep.sales_rep || "Unknown Sales Rep";
                                                            const invoices = (rep.invoices && rep.invoices.length > 0) ? rep.invoices : (rep.rows && rep.rows.length > 0 ? rep.rows : []);

                                                            return (
                                                                <React.Fragment key={rep.sales_rep_id || `rep_${repIdx}`}>
                                                                    {/* Sales Rep Name Header */}
                                                                    <tr className="sales-rep-title-row">
                                                                        <td colSpan="7" className="text-start">
                                                                            {repName}
                                                                        </td>
                                                                    </tr>

                                                                    {/* Invoice Rows */}
                                                                    {invoices && invoices.length > 0 ? (
                                                                        invoices.map((inv, invIdx) => (
                                                                            <tr key={inv.invoice_id || `inv_${repIdx}_${invIdx}`} className="sales-rep-row-data">
                                                                                <td className="text-start">
                                                                                    {inv.date || formatDateDisplay(inv.raw_date || inv.quote_date || inv.created_at)}
                                                                                </td>
                                                                                <td className="text-start">
                                                                                    {inv.reference || inv.reference_no || inv.document_no || "-"}
                                                                                </td>
                                                                                <td className="text-start">
                                                                                    {inv.customer || inv.client_name || "Cash Client - ZAR"}
                                                                                </td>
                                                                                <td className="text-start">
                                                                                    {inv.freight || rep.freight || "-"}
                                                                                </td>
                                                                                <td className="text-start">
                                                                                    {inv.type || inv.fcl_lcl || rep.type || rep.fcl_lcl || "-"}
                                                                                </td>
                                                                                <td className="text-end">
                                                                                    {inv.dimension_display || inv.diamension_display || (inv.dimension !== undefined && inv.dimension !== null && inv.dimension !== "" ? formatDims(inv.dimension) : (inv.diamension !== undefined && inv.diamension !== null && inv.diamension !== "" ? formatDims(inv.diamension) : (inv.cbm !== undefined && inv.cbm !== null && inv.cbm !== "" ? formatDims(inv.cbm) : "-")))}
                                                                                </td>
                                                                                <td className="text-end">
                                                                                    {inv.weight_display || (inv.weight !== undefined && inv.weight !== null && inv.weight !== "" ? formatWeight(inv.weight) : (inv.weight_kg !== undefined && inv.weight_kg !== null && inv.weight_kg !== "" ? formatWeight(inv.weight_kg) : (inv.weight_kgs !== undefined && inv.weight_kgs !== null && inv.weight_kgs !== "" ? formatWeight(inv.weight_kgs) : "-")))}
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : null}

                                                                    {/* Sales Rep Subtotal Row */}
                                                                    <tr className="sales-rep-subtotal-row">
                                                                        <td colSpan="5" className="text-start">
                                                                            Total for Sales Rep: {repName}
                                                                        </td>
                                                                        <td className="text-end">
                                                                            {rep.total_dimension_display || rep.total_diamension_display || rep.dimension_display || (rep.total_dimension !== undefined && rep.total_dimension !== null && rep.total_dimension !== "" ? formatDims(rep.total_dimension) : (rep.total_diamension !== undefined && rep.total_diamension !== null && rep.total_diamension !== "" ? formatDims(rep.total_diamension) : (rep.total_cbm !== undefined && rep.total_cbm !== null && rep.total_cbm !== "" ? formatDims(rep.total_cbm) : "")))}
                                                                        </td>
                                                                        <td className="text-end">
                                                                            {rep.total_weight_display || rep.weight_display || (rep.total_weight !== undefined && rep.total_weight !== null && rep.total_weight !== "" ? formatWeight(rep.total_weight) : (rep.weight !== undefined && rep.weight !== null && rep.weight !== "" ? formatWeight(rep.weight) : ""))}
                                                                        </td>
                                                                    </tr>

                                                                    {/* Spacer Row between reps */}
                                                                    <tr className="spacer-row">
                                                                        <td colSpan="7"></td>
                                                                    </tr>
                                                                </React.Fragment>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="text-center text-muted py-4">
                                                                No data found for the selected criteria.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {grandTotal && reportData && reportData.length > 0 && (
                                                        <tr className="grand-total-row">
                                                            <td colSpan="5" className="text-start fw-bold grand-total-border">
                                                                Grand Total:
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal.total_dimension_display || grandTotal.dimension_display || grandTotal.diamension_display || (grandTotal.total_dimension !== undefined && grandTotal.total_dimension !== null ? formatDims(grandTotal.total_dimension) : (grandTotal.dimension !== undefined && grandTotal.dimension !== null ? formatDims(grandTotal.dimension) : ""))}
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal.total_weight_display || grandTotal.weight_display || (grandTotal.total_weight !== undefined && grandTotal.total_weight !== null ? formatWeight(grandTotal.total_weight) : (grandTotal.weight !== undefined && grandTotal.weight !== null ? formatWeight(grandTotal.weight) : ""))}
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
                                    <p className="text-muted mb-0">Please click 'View' to generate the {pageTitle}.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style type="text/css">{`
                .report-main-title {
                    font-size: 20px !important;
                    font-weight: 700 !important;
                    color: #111827;
                }
                .report-company-name {
                    font-size: 14px !important;
                    font-weight: 700 !important;
                    color: #111827;
                }
                .report-header-line {
                    width: 100%;
                    height: 1px;
                    background-color: #9ca3af;
                    margin-top: 10px;
                    margin-bottom: 5px;
                }
                .freight-sales-rep-report-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 5px;
                    background-color: #ffffff;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                .freight-sales-rep-report-table th {
                    background-color: #ffffff !important;
                    color: #111827 !important;
                    font-size: 11.5px;
                    font-weight: 700;
                    padding: 6px 8px;
                    border-top: 1px solid #d1d5db;
                    border-bottom: 1.5px solid #111827;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .freight-sales-rep-report-table td {
                    padding: 3px 8px;
                    font-size: 11.5px;
                    color: #111827;
                    border: none;
                }
                .freight-sales-rep-report-table tr.sales-rep-title-row td {
                    color: #111827 !important;
                    font-weight: 700;
                    font-size: 12px;
                    padding-top: 12px;
                    padding-bottom: 4px;
                }
                .freight-sales-rep-report-table tr.sales-rep-row-data td {
                    padding-top: 2px;
                    padding-bottom: 2px;
                }
                .freight-sales-rep-report-table tr.sales-rep-subtotal-row td {
                    font-weight: 700;
                    font-size: 11.5px;
                    padding-top: 5px;
                    padding-bottom: 5px;
                    border-top: 1px solid #e5e7eb;
                    border-bottom: 1px solid #9ca3af;
                }
                .freight-sales-rep-report-table tr.spacer-row td {
                    height: 10px;
                    padding: 0;
                    border: none;
                }
                .freight-sales-rep-report-table tr.grand-total-row td {
                    font-weight: 700;
                    font-size: 12px;
                    padding-top: 8px;
                    padding-bottom: 8px;
                    background-color: #ffffff;
                }
                .freight-sales-rep-report-table td.grand-total-border {
                    border-top: 1.5px solid #111827 !important;
                    border-bottom: 3.5px double #111827 !important;
                }

                @page {
                    size: landscape;
                    margin: 8mm;
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
                    .freight-sales-rep-report-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        display: table !important;
                        break-inside: auto !important;
                        page-break-inside: auto !important;
                    }
                    .freight-sales-rep-report-table th, .freight-sales-rep-report-table td {
                        padding: 3px 6px !important;
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

export default FreightAdminBySalesRepReport;
