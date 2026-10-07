import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const FreightAdminByCustomerReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isFreightOrders = location.pathname.includes("freight-orders");
    const pageTitle = isFreightOrders ? "Freight Orders - By Customer Report" : "Freight by Admin - By Customer Report";
    const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
    const userid = userdata?.id;
    const usertype = userdata?.user_type;
    const [hasPermission, setHasPermission] = useState(null);

    // Date Helpers (Default last 30 days)
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
        const parts = dateStr.split("-");
        if (parts.length === 3 && parts[0].length === 4) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    };

    // Filter States
    const [startDate, setStartDate] = useState(getDefaultStartDate());
    const [endDate, setEndDate] = useState(getDefaultEndDate());
    const [customerFrom, setCustomerFrom] = useState("");
    const [customerTo, setCustomerTo] = useState("");
    const [activeStatus, setActiveStatus] = useState("both"); // default "both"
    const [categoryFrom, setCategoryFrom] = useState("");
    const [categoryTo, setCategoryTo] = useState("");
    const [includeCreditNotes, setIncludeCreditNotes] = useState(true);
    const [style, setStyle] = useState("Detailed"); // "Detailed" | "Summary"

    // Data States
    const [reportInfo, setReportInfo] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [totals, setTotals] = useState(null);
    const [grandTotal, setGrandTotal] = useState(null);
    const [clientList, setClientList] = useState([]);
    const [loader, setLoader] = useState(true);
    const [searched, setSearched] = useState(false);

    const handleReset = () => {
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
        setCustomerFrom("");
        setCustomerTo("");
        setActiveStatus("both");
        setCategoryFrom("");
        setCategoryTo("");
        setIncludeCreditNotes(true);
        setStyle("Detailed");
        setCustomers([]);
        setReportInfo(null);
        setTotals(null);
        setGrandTotal(null);
        setSearched(false);
    };

    const handlePrint = () => {
        window.print();
    };

    // Fetch Clients for dropdowns
    const fetchClientList = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}clientlist`);
            if (response.data && response.data.success) {
                const list = response.data.data || [];
                const sortedList = [...list]
                    .filter((item) => item && (item.client_name || item.name))
                    .sort((a, b) => ((a.client_name || a.name || "").localeCompare(b.client_name || b.name || "")));
                setClientList(sortedList);
            }
        } catch (error) {
            console.error("Error fetching client list:", error);
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
                from_customer: customerFrom || "All",
                to_customer: customerTo || "All",
                active: activeStatus === "both" || activeStatus === "Both" ? "Both" : (activeStatus || "Both"),
                from_category: categoryFrom || "All",
                to_category: categoryTo || "All",
                start_date: startDate || "",
                start_date_formatted: startDateFormatted,
                end_date: endDate || "",
                end_date_formatted: endDateFormatted,
                include_credit_notes: includeCreditNotes,
                style: style || "Detailed"
            };

            const payload = {
                ...filtersPayload,
                filters: filtersPayload
            };

            const endpoint = isFreightOrders ? "newSalesByCustomerOrderReport" : "newSalesByCustomerReport";

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}${endpoint}`,
                payload
            );

            if (response.data && (response.data.success || response.data.customers || response.data.data)) {
                const resData = response.data.data && typeof response.data.data === "object" && !Array.isArray(response.data.data)
                    ? response.data.data
                    : response.data;
                setReportInfo(resData.report_info || response.data.report_info || null);
                setCustomers(resData.customers || response.data.customers || (Array.isArray(response.data.data) ? response.data.data : []));
                setTotals(resData.totals || response.data.totals || null);
                setGrandTotal(resData.grand_total || response.data.grand_total || resData.totals || response.data.totals || null);
            } else {
                toast.error(response.data?.message || "Failed to fetch report");
                setCustomers([]);
            }
        } catch (error) {
            console.error(`Error fetching ${pageTitle}:`, error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
            setCustomers([]);
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
                route_url: location.pathname || (isFreightOrders ? "/Admin/freight-orders-by-customer-report" : "/Admin/freight-admin-by-customer-report"),
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
        fetchClientList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    // Format currency helper
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

    // Format qty helper
    const formatQty = (qty) => {
        if (qty === null || qty === undefined || qty === "" || parseFloat(qty) === 0) return "";
        const num = parseFloat(qty);
        if (isNaN(num)) return "";
        return num.toFixed(4);
    };

    // Format dims helper
    const formatDims = (dims) => {
        if (dims === null || dims === undefined || dims === "" || parseFloat(dims) === 0) return "";
        const num = parseFloat(dims);
        if (isNaN(num)) return typeof dims === "string" ? dims : "";
        return num.toFixed(4);
    };

    // Format weight helper
    const formatWeight = (weight) => {
        if (weight === null || weight === undefined || weight === "" || parseFloat(weight) === 0) return "";
        const num = parseFloat(weight);
        if (isNaN(num)) return typeof weight === "string" ? weight : "";
        return num.toFixed(4);
    };

    const formatDateDisplay = (dateVal) => {
        if (!dateVal) return "";
        if (typeof dateVal === "string" && dateVal.includes("/")) return dateVal;
        const date = new Date(dateVal);
        if (Number.isNaN(date.getTime())) return typeof dateVal === "string" ? dateVal : "";
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
                                <h4 className="freight_hd">Freight by admin - by customer report</h4>
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
                                    {/* Grid Row 1: Dates and Customers */}
                                    <div className="row g-3 align-items-end mb-3">
                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
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
                                                className="form-control"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                From Customer
                                            </label>
                                            <select
                                                className="form-select"
                                                value={customerFrom}
                                                onChange={(e) => setCustomerFrom(e.target.value)}
                                            >
                                                <option value="">All Customers (From)</option>
                                                {clientList.map((client, index) => {
                                                    const cName = client.client_name || client.name;
                                                    return (
                                                        <option key={`from_${client.id || index}`} value={cName}>
                                                            {cName}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                To Customer
                                            </label>
                                            <select
                                                className="form-select"
                                                value={customerTo}
                                                onChange={(e) => setCustomerTo(e.target.value)}
                                            >
                                                <option value="">All Customers (To)</option>
                                                {clientList.map((client, index) => {
                                                    const cName = client.client_name || client.name;
                                                    return (
                                                        <option key={`to_${client.id || index}`} value={cName}>
                                                            {cName}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Grid Row 2: Categories, Status, Style */}
                                    <div className="row g-3 align-items-end mb-3">
                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                From Category
                                            </label>
                                            <select
                                                className="form-select"
                                                value={categoryFrom}
                                                onChange={(e) => setCategoryFrom(e.target.value)}
                                            >
                                                <option value="">All Categories (From)</option>
                                                <option value="South Africa">South Africa</option>
                                                <option value="Zambia">Zambia</option>
                                                <option value="Zimbabwe">Zimbabwe</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                To Category
                                            </label>
                                            <select
                                                className="form-select"
                                                value={categoryTo}
                                                onChange={(e) => setCategoryTo(e.target.value)}
                                            >
                                                <option value="">All Categories (To)</option>
                                                <option value="South Africa">South Africa</option>
                                                <option value="Zambia">Zambia</option>
                                                <option value="Zimbabwe">Zimbabwe</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Active Status
                                            </label>
                                            <select
                                                className="form-select"
                                                value={activeStatus}
                                                onChange={(e) => setActiveStatus(e.target.value)}
                                            >
                                                <option value="both">Both</option>
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Style
                                            </label>
                                            <select
                                                className="form-select"
                                                value={style}
                                                onChange={(e) => setStyle(e.target.value)}
                                            >
                                                <option value="Detailed">Detailed</option>
                                                <option value="Summary">Summary</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Grid Row 3: Credit Notes and Actions */}
                                    <div className="row g-3 align-items-center pt-2">
                                        <div className="col-md-6 col-12">
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
                                                    style={{ fontSize: "13px", cursor: "pointer" }}
                                                >
                                                    Include Credit Notes
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-md-6 col-12 d-flex justify-content-md-end gap-2">
                                            <button type="submit" className="btn btn-primary blueBtn px-4 py-2">
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary px-4 py-2"
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
                                    <h4 className="fw-bold text-dark text-center mb-4">
                                        {reportInfo?.title || pageTitle}
                                    </h4>
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div>
                                            <h5 className="fw-bold text-dark mb-0">
                                                {reportInfo?.company || "Asia Direct Africa"}
                                            </h5>
                                        </div>
                                        <div className="text-end" style={{ fontSize: "12px" }}>
                                            <div className="d-flex justify-content-end gap-3 mb-1">
                                                <span className="fw-bold text-dark">Start Date:</span>
                                                <span className="text-dark" style={{ minWidth: "90px", textAlign: "right" }}>
                                                    {reportInfo?.start_date || (startDate ? formatToDDMMYYYY(startDate) : "-")}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-end gap-3 mb-1">
                                                <span className="fw-bold text-dark">End Date:</span>
                                                <span className="text-dark" style={{ minWidth: "90px", textAlign: "right" }}>
                                                    {reportInfo?.end_date || (endDate ? formatToDDMMYYYY(endDate) : "-")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Report Table */}
                                    <div className="table-responsive">
                                        {style === "Detailed" ? (
                                            <table className="custom-sales-report-table">
                                                <thead>
                                                    <tr className="header-row">
                                                        <th className="text-start" style={{ width: "12%" }}>Date</th>
                                                        <th className="text-start" style={{ width: "15%" }}>Reference</th>
                                                        <th className="text-start" style={{ width: "35%" }}>Description</th>
                                                        <th className="text-start" style={{ width: "10%" }}>Freight</th>
                                                        <th className="text-start" style={{ width: "10%" }}>Option</th>
                                                        <th className="text-end" style={{ width: "9%" }}>Dims (Cbm)</th>
                                                        <th className="text-end" style={{ width: "9%" }}>Weight (Kgs)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {customers.length > 0 ? (
                                                        customers.map((customer, custIdx) => (
                                                            <React.Fragment key={customer.customer_id || `cust_${custIdx}`}>
                                                                {/* Customer Name Header */}
                                                                <tr className="customer-row">
                                                                    <td colSpan="7" className="customer-name">
                                                                        {customer.customer_name || customer.name || "Unknown Customer"}
                                                                    </td>
                                                                </tr>

                                                                {/* Invoices */}
                                                                {customer.invoices && customer.invoices.length > 0 ? (
                                                                    customer.invoices.map((invoice, invIdx) => (
                                                                        <React.Fragment key={invoice.invoice_id || `inv_${invIdx}`}>
                                                                            {invoice.items && invoice.items.length > 0 ? (
                                                                                invoice.items.map((item, itemIdx) => {
                                                                                    const isFirst = itemIdx === 0;
                                                                                    const itemFreight = item.freight || invoice.freight || "-";
                                                                                    const itemOption = item.type || item.fcl_lcl || invoice.type || invoice.fcl_lcl || "-";
                                                                                    const itemDims = item.dimension_display || item.diamension_display || (item.dimension !== undefined && item.dimension !== null && item.dimension !== "" ? formatDims(item.dimension) : (item.diamension !== undefined && item.diamension !== null && item.diamension !== "" ? formatDims(item.diamension) : (isFirst ? (invoice.dimension_display || invoice.diamension_display || (invoice.dimension !== undefined && invoice.dimension !== null && invoice.dimension !== "" ? formatDims(invoice.dimension) : "")) : "")));
                                                                                    const itemWeight = item.weight_display || (item.weight !== undefined && item.weight !== null && item.weight !== "" ? formatWeight(item.weight) : (isFirst ? (invoice.weight_display || (invoice.weight !== undefined && invoice.weight !== null && invoice.weight !== "" ? formatWeight(invoice.weight) : "")) : ""));
                                                                                    return (
                                                                                        <tr key={`item_${itemIdx}`} className="invoice-item-row">
                                                                                            <td className="text-start">
                                                                                                {isFirst ? (invoice.date || formatDateDisplay(invoice.raw_date)) : ""}
                                                                                            </td>
                                                                                            <td className="text-start">
                                                                                                {isFirst ? (invoice.reference || invoice.reference_no || "-") : ""}
                                                                                            </td>
                                                                                            <td className="text-start">
                                                                                                {item.description || "-"}
                                                                                            </td>
                                                                                            <td className="text-start">
                                                                                                {isFirst ? itemFreight : (item.freight || "")}
                                                                                            </td>
                                                                                            <td className="text-start">
                                                                                                {isFirst ? itemOption : (item.type || item.fcl_lcl || "")}
                                                                                            </td>
                                                                                            <td className="text-end">
                                                                                                {itemDims}
                                                                                            </td>
                                                                                            <td className="text-end">
                                                                                                {itemWeight}
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })
                                                                            ) : (
                                                                                <tr className="invoice-item-row">
                                                                                    <td className="text-start">
                                                                                        {invoice.date || formatDateDisplay(invoice.raw_date)}
                                                                                    </td>
                                                                                    <td className="text-start">
                                                                                        {invoice.reference || invoice.reference_no || "-"}
                                                                                    </td>
                                                                                    <td className="text-start">-</td>
                                                                                    <td className="text-start">{invoice.freight || "-"}</td>
                                                                                    <td className="text-start">{invoice.type || invoice.fcl_lcl || "-"}</td>
                                                                                    <td className="text-end">{invoice.dimension_display || invoice.diamension_display || (invoice.dimension !== undefined && invoice.dimension !== null && invoice.dimension !== "" ? formatDims(invoice.dimension) : "")}</td>
                                                                                    <td className="text-end">{invoice.weight_display || (invoice.weight !== undefined && invoice.weight !== null && invoice.weight !== "" ? formatWeight(invoice.weight) : "")}</td>
                                                                                </tr>
                                                                            )}

                                                                            {/* Invoice Total Row */}
                                                                            <tr className="invoice-total-row">
                                                                                <td colSpan="5" className="text-start fw-bold">
                                                                                    Total:&nbsp;&nbsp;&nbsp;{invoice.reference || invoice.reference_no}
                                                                                </td>
                                                                                <td className="text-end fw-bold invoice-total-border">
                                                                                    {invoice.dimension_display || invoice.diamension_display || (invoice.dimension !== undefined && invoice.dimension !== null && invoice.dimension !== "" ? formatDims(invoice.dimension) : (invoice.diamension !== undefined && invoice.diamension !== null && invoice.diamension !== "" ? formatDims(invoice.diamension) : ""))}
                                                                                </td>
                                                                                <td className="text-end fw-bold invoice-total-border">
                                                                                    {invoice.weight_display || (invoice.weight !== undefined && invoice.weight !== null && invoice.weight !== "" ? formatWeight(invoice.weight) : "")}
                                                                                </td>
                                                                            </tr>

                                                                            {/* Spacer between invoices */}
                                                                            <tr className="spacer-row">
                                                                                <td colSpan="7"></td>
                                                                            </tr>
                                                                        </React.Fragment>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="7" className="text-center text-muted py-2">
                                                                            No invoices found for this customer.
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="text-center text-muted py-4">
                                                                No data available for the selected filters.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {grandTotal && customers.length > 0 && (
                                                        <tr className="grand-total-row" style={{ borderTop: "2px solid #000" }}>
                                                            <td colSpan="5" className="text-start fw-bold" style={{ fontSize: "11px", paddingTop: "8px", paddingBottom: "8px" }}>
                                                                Grand Total:
                                                            </td>
                                                            <td className="text-end fw-bold" style={{ fontSize: "11px", paddingTop: "8px", paddingBottom: "8px", borderTop: "2px solid #000" }}>
                                                                {grandTotal.total_dimension_display || grandTotal.dimension_display || grandTotal.diamension_display || (grandTotal.total_dimension !== undefined ? formatDims(grandTotal.total_dimension) : (grandTotal.dimension !== undefined ? formatDims(grandTotal.dimension) : ""))}
                                                            </td>
                                                            <td className="text-end fw-bold" style={{ fontSize: "11px", paddingTop: "8px", paddingBottom: "8px", borderTop: "2px solid #000" }}>
                                                                {grandTotal.total_weight_display || grandTotal.weight_display || (grandTotal.total_weight !== undefined ? formatWeight(grandTotal.total_weight) : (grandTotal.weight !== undefined ? formatWeight(grandTotal.weight) : ""))}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        ) : (
                                            /* Summary Style Table (matching Summary format) */
                                            <table className="custom-sales-report-table">
                                                <thead>
                                                    <tr className="header-row">
                                                        <th className="text-start" style={{ width: "12%" }}>Date</th>
                                                        <th className="text-start" style={{ width: "15%" }}>Reference</th>
                                                        <th className="text-start" style={{ width: "35%" }}>Description</th>
                                                        <th className="text-start" style={{ width: "10%" }}>Freight</th>
                                                        <th className="text-start" style={{ width: "10%" }}>Option</th>
                                                        <th className="text-end" style={{ width: "9%" }}>Dims (Cbm)</th>
                                                        <th className="text-end" style={{ width: "9%" }}>Weight (Kgs)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {customers.length > 0 ? (
                                                        customers.map((customer, custIdx) => (
                                                            <React.Fragment key={customer.customer_id || `cust_sum_${custIdx}`}>
                                                                {/* Customer Name Header */}
                                                                <tr className="customer-row">
                                                                    <td colSpan="7" className="customer-name">
                                                                        {customer.customer_name || customer.name || "Unknown Customer"}
                                                                    </td>
                                                                </tr>

                                                                {/* Customer Invoices */}
                                                                {customer.invoices && customer.invoices.length > 0 ? (
                                                                    customer.invoices.map((invoice, invIdx) => (
                                                                        <tr key={invoice.invoice_id || `inv_${invIdx}`} className="invoice-item-row">
                                                                            <td className="text-start">
                                                                                {invoice.date || formatDateDisplay(invoice.raw_date)}
                                                                            </td>
                                                                            <td className="text-start">
                                                                                {invoice.reference || invoice.reference_no || "-"}
                                                                            </td>
                                                                            <td className="text-start"></td>
                                                                            <td className="text-start">{invoice.freight || "-"}</td>
                                                                            <td className="text-start">{invoice.type || invoice.fcl_lcl || "-"}</td>
                                                                            <td className="text-end">
                                                                                {invoice.dimension_display || invoice.diamension_display || (invoice.dimension !== undefined && invoice.dimension !== null && invoice.dimension !== "" ? formatDims(invoice.dimension) : (invoice.diamension !== undefined && invoice.diamension !== null && invoice.diamension !== "" ? formatDims(invoice.diamension) : ""))}
                                                                            </td>
                                                                            <td className="text-end">
                                                                                {invoice.weight_display || (invoice.weight !== undefined && invoice.weight !== null && invoice.weight !== "" ? formatWeight(invoice.weight) : "")}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : null}

                                                                {/* Total for Customer Row */}
                                                                <tr className="customer-total-row">
                                                                    <td colSpan="5" className="text-start fw-bold">
                                                                        Total for Customer:&nbsp;&nbsp;&nbsp;{customer.customer_name || customer.name}
                                                                    </td>
                                                                    <td className="text-end fw-bold customer-total-border">
                                                                        {customer.total_dimension_display || customer.dimension_display || customer.diamension_display || (customer.total_dimension !== undefined ? formatDims(customer.total_dimension) : (customer.dimension !== undefined ? formatDims(customer.dimension) : (customer.diamension !== undefined ? formatDims(customer.diamension) : "")))}
                                                                    </td>
                                                                    <td className="text-end fw-bold customer-total-border">
                                                                        {customer.total_weight_display || customer.weight_display || (customer.total_weight !== undefined ? formatWeight(customer.total_weight) : (customer.weight !== undefined ? formatWeight(customer.weight) : ""))}
                                                                    </td>
                                                                </tr>

                                                                {/* Spacer between customers */}
                                                                <tr className="spacer-row" style={{ height: "16px" }}>
                                                                    <td colSpan="7"></td>
                                                                </tr>
                                                            </React.Fragment>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="text-center text-muted py-4">
                                                                No data available for the selected filters.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {grandTotal && customers.length > 0 && (
                                                        <tr className="grand-total-row" style={{ borderTop: "2px solid #000" }}>
                                                            <td colSpan="5" className="text-start fw-bold" style={{ fontSize: "11px", paddingTop: "8px", paddingBottom: "8px" }}>
                                                                Grand Total:
                                                            </td>
                                                            <td className="text-end fw-bold" style={{ fontSize: "11px", paddingTop: "8px", paddingBottom: "8px", borderTop: "2px solid #000" }}>
                                                                {grandTotal.total_dimension_display || grandTotal.dimension_display || grandTotal.diamension_display || (grandTotal.total_dimension !== undefined ? formatDims(grandTotal.total_dimension) : (grandTotal.dimension !== undefined ? formatDims(grandTotal.dimension) : ""))}
                                                            </td>
                                                            <td className="text-end fw-bold" style={{ fontSize: "11px", paddingTop: "8px", paddingBottom: "8px", borderTop: "2px solid #000" }}>
                                                                {grandTotal.total_weight_display || grandTotal.weight_display || (grandTotal.total_weight !== undefined ? formatWeight(grandTotal.total_weight) : (grandTotal.weight !== undefined ? formatWeight(grandTotal.weight) : ""))}
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
                                    <p className="text-muted mb-0">Please use the filter card to search for report data.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style type="text/css">{`
                .custom-sales-report-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #000;
                }
                .custom-sales-report-table thead tr.header-row th {
                    background-color: #1b2245 !important;
                    color: #ffffff !important;
                    border: none;
                    font-size: 11px;
                    font-weight: bold;
                    padding: 8px 8px;
                    vertical-align: middle;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .custom-sales-report-table tbody tr.customer-row td.customer-name {
                    font-size: 12px;
                    font-weight: bold;
                    color: #000;
                    padding-top: 14px;
                    padding-bottom: 4px;
                    padding-left: 8px;
                }
                .custom-sales-report-table tbody tr.invoice-item-row td {
                    font-size: 11px;
                    color: #000;
                    padding: 3px 8px;
                    border: none;
                }
                .custom-sales-report-table tbody tr.invoice-total-row td {
                    font-size: 11px;
                    color: #000;
                    padding: 4px 8px;
                    border: none;
                }
                .custom-sales-report-table tbody tr.invoice-total-row td.invoice-total-border {
                    border-top: 1px solid #777;
                }
                .custom-sales-report-table tbody tr.customer-total-row td {
                    font-size: 11px;
                    color: #000;
                    padding: 6px 8px;
                    border: none;
                }
                .custom-sales-report-table tbody tr.customer-total-row td.customer-total-border {
                    border-top: 1px solid #000;
                }
                .custom-sales-report-table tbody tr.spacer-row td {
                    height: 14px;
                    border: none;
                    padding: 0;
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
                        position: static !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    body {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
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
                    .custom-sales-report-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        display: table !important;
                        page-break-inside: auto !important;
                    }
                    .custom-sales-report-table tr {
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>
        </>
    );
};

export default FreightAdminByCustomerReport;
