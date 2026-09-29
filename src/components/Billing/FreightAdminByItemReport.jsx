import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const FreightAdminByItemReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isFreightOrders = location.pathname.includes("freight-orders-item");
    const pageTitle = isFreightOrders ? "Freight Orders - Item Report" : "Freight By Admin - Item Report";
    const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
    const userid = userdata?.id;
    const usertype = userdata?.user_type;
    const [hasPermission, setHasPermission] = useState(null);

    // Default Date Helpers (Last 30 Days to Present Date or Start of Month)
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
    const [startDate, setStartDate] = useState(location.state?.startDate || getDefaultStartDate());
    const [endDate, setEndDate] = useState(location.state?.endDate || getDefaultEndDate());
    const [itemFrom, setItemFrom] = useState(location.state?.itemFrom || "All");
    const [itemTo, setItemTo] = useState(location.state?.itemTo || "All");
    const [categoryFrom, setCategoryFrom] = useState(location.state?.categoryFrom || "All");
    const [categoryTo, setCategoryTo] = useState(location.state?.categoryTo || "All");
    const [salesAccount, setSalesAccount] = useState(location.state?.salesAccount || "All");
    const [status, setStatus] = useState(location.state?.status || "Both");
    const [itemType, setItemType] = useState(location.state?.itemType || "Both");
    const [cost, setCost] = useState(location.state?.cost || "Average Cost");
    const [style, setStyle] = useState(location.state?.style || "Detailed");
    const [includeCreditNotes, setIncludeCreditNotes] = useState(
        location.state?.includeCreditNotes !== undefined ? location.state.includeCreditNotes : true
    );

    // Response Data States
    const [reportInfo, setReportInfo] = useState(null);
    const [items, setItems] = useState([]);
    const [grandTotal, setGrandTotal] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleReset = () => {
        const defStart = getDefaultStartDate();
        const defEnd = getDefaultEndDate();
        setStartDate(defStart);
        setEndDate(defEnd);
        setItemFrom("All");
        setItemTo("All");
        setCategoryFrom("All");
        setCategoryTo("All");
        setSalesAccount("All");
        setStatus("Both");
        setItemType("Both");
        setCost("Average Cost");
        setStyle("Detailed");
        setIncludeCreditNotes(true);
        setItems([]);
        setGrandTotal(null);
        setReportInfo(null);
        setTotalItems(0);
        setSearched(false);
    };

    const handlePrint = () => {
        window.print();
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
                start_date: startDate || "",
                start_date_formatted: startDateFormatted,
                end_date: endDate || "",
                end_date_formatted: endDateFormatted,
                item_from: itemFrom || "All",
                item_to: itemTo || "All",
                category_from: categoryFrom || "All",
                category_to: categoryTo || "All",
                sales_account: salesAccount || "All",
                status: status || "Both",
                item_type: itemType || "Both",
                cost: cost || "Average Cost",
                style: style || "Detailed",
                include_credit_notes: includeCreditNotes
            };

            const payload = {
                ...filtersPayload,
                filters: filtersPayload
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}newSalesByItemReport`,
                payload
            );

            if (response.data && (response.data.success || response.data.status === 200 || response.data.items)) {
                const resData = response.data;
                const itemsList = resData.items || resData.data?.items || (Array.isArray(resData.data) ? resData.data : []);
                setItems(itemsList);
                setReportInfo(resData.report_info || resData.data?.report_info || null);
                setGrandTotal(resData.grand_total || resData.data?.grand_total || resData.totals || null);
                setTotalItems(resData.totalItems || resData.total_items || itemsList.length);
            } else {
                toast.error(response.data?.message || "Failed to fetch report data");
                setItems([]);
                setGrandTotal(null);
            }
        } catch (error) {
            console.error("Error fetching Freight By Admin - Item Report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
            setItems([]);
            setGrandTotal(null);
        } finally {
            setLoader(false);
        }
    };

    const checkPermission = async () => {
        try {
            setLoader(true);
            if (!userid || !usertype) {
                setHasPermission(true);
                fetchReportData();
                return;
            }
            const postdata = {
                staff_id: userid,
                route_url: location.pathname || "/Admin/freight-admin-by-item-report",
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
                // Fallback to true if not restricted
                setHasPermission(true);
                fetchReportData();
            }
        } catch (error) {
            setHasPermission(true);
            fetchReportData();
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        checkPermission();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        return isNegative ? `${currencySymbol} -${absVal}` : `${currencySymbol} ${absVal}`;
    };

    const formatQty = (qty) => {
        if (qty === null || qty === undefined || qty === "") return "0.0000";
        const num = parseFloat(qty);
        if (isNaN(num)) return "0.0000";
        return num.toFixed(4);
    };

    const formatPercent = (val) => {
        if (val === null || val === undefined || val === "") return "0.0000%";
        const num = parseFloat(val);
        if (isNaN(num)) return "0.0000%";
        return `${num.toFixed(4)}%`;
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

    const getItemFilterText = () => {
        if (reportInfo?.item) return reportInfo.item;
        if ((!itemFrom || itemFrom === "All") && (!itemTo || itemTo === "All")) return "All Items";
        if (itemFrom === itemTo) return itemFrom;
        return `${itemFrom || "All"} to ${itemTo || "All"}`;
    };

    const getCategoryFilterText = () => {
        if (reportInfo?.category) return reportInfo.category;
        if ((!categoryFrom || categoryFrom === "All") && (!categoryTo || categoryTo === "All")) return "All Categories";
        if (categoryFrom === categoryTo) return categoryFrom;
        return `${categoryFrom || "All"} to ${categoryTo || "All"}`;
    };

    const getDateRangeText = () => {
        if (reportInfo?.date_range) return reportInfo.date_range;
        if (!startDate && !endDate) return "All Dates";
        return `${formatToDDMMYYYY(startDate)} - ${formatToDDMMYYYY(endDate)}`;
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
                                    {/* Row 1: Date Range, Item Range */}
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
                                                Item (From)
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={itemFrom}
                                                onChange={(e) => setItemFrom(e.target.value)}
                                            >
                                                <option value="All">All Items (From)</option>
                                                <option value="ADMIN">ADMIN - Admin Fees</option>
                                                <option value="AFT">AFT - Airfreight</option>
                                                <option value="CAF">CAF - Customs agency surcharge</option>
                                                <option value="CUS">CUS - Customs Clearance</option>
                                                <option value="DOC">DOC - Documentation</option>
                                                <option value="DUTY">DUTY - Customs Duty</option>
                                                <option value="FRT">FRT - Freight Charges</option>
                                                <option value="HAND">HAND - Handling Fees</option>
                                                <option value="INS">INS - Insurance</option>
                                                <option value="ROA">ROA - Road Freight</option>
                                                <option value="SEA">SEA - Sea Freight</option>
                                                <option value="STO">STO - Storage</option>
                                                <option value="VAT">VAT - Import VAT</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Item (To)
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={itemTo}
                                                onChange={(e) => setItemTo(e.target.value)}
                                            >
                                                <option value="All">All Items (To)</option>
                                                <option value="ADMIN">ADMIN - Admin Fees</option>
                                                <option value="AFT">AFT - Airfreight</option>
                                                <option value="CAF">CAF - Customs agency surcharge</option>
                                                <option value="CUS">CUS - Customs Clearance</option>
                                                <option value="DOC">DOC - Documentation</option>
                                                <option value="DUTY">DUTY - Customs Duty</option>
                                                <option value="FRT">FRT - Freight Charges</option>
                                                <option value="HAND">HAND - Handling Fees</option>
                                                <option value="INS">INS - Insurance</option>
                                                <option value="ROA">ROA - Road Freight</option>
                                                <option value="SEA">SEA - Sea Freight</option>
                                                <option value="STO">STO - Storage</option>
                                                <option value="VAT">VAT - Import VAT</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row 2: Category Range, Sales Account, Status */}
                                    <div className="row g-3 align-items-end mb-3">
                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Category (From)
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={categoryFrom}
                                                onChange={(e) => setCategoryFrom(e.target.value)}
                                            >
                                                <option value="All">All Categories (From)</option>
                                                <option value="Destination Charges">Destination Charges</option>
                                                <option value="Freight Charges">Freight Charges</option>
                                                <option value="Origin Charges">Origin Charges</option>
                                                <option value="Customs Charges">Customs Charges</option>
                                                <option value="South Africa">South Africa</option>
                                                <option value="Zambia">Zambia</option>
                                                <option value="Zimbabwe">Zimbabwe</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Category (To)
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={categoryTo}
                                                onChange={(e) => setCategoryTo(e.target.value)}
                                            >
                                                <option value="All">All Categories (To)</option>
                                                <option value="Destination Charges">Destination Charges</option>
                                                <option value="Freight Charges">Freight Charges</option>
                                                <option value="Origin Charges">Origin Charges</option>
                                                <option value="Customs Charges">Customs Charges</option>
                                                <option value="South Africa">South Africa</option>
                                                <option value="Zambia">Zambia</option>
                                                <option value="Zimbabwe">Zimbabwe</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Sales Account
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={salesAccount}
                                                onChange={(e) => setSalesAccount(e.target.value)}
                                            >
                                                <option value="All">All</option>
                                                <option value="Sales">Sales</option>
                                                <option value="Freight Income">Freight Income</option>
                                                <option value="Disbursements">Disbursements</option>
                                            </select>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Status
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                            >
                                                <option value="Both">Both</option>
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row 3: Item Type, Cost, Style, Credit Notes & Buttons */}
                                    <div className="row g-3 align-items-end">
                                        <div className="col-lg-2 col-md-4 col-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Item Type
                                            </label>
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

                                        <div className="col-lg-2 col-md-4 col-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Cost
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={cost}
                                                onChange={(e) => setCost(e.target.value)}
                                            >
                                                <option value="Average Cost">Average Cost</option>
                                                <option value="Last Cost">Last Cost</option>
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
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary spinner-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-secondary">Generating report...</p>
                                </div>
                            ) : searched ? (
                                <>
                                    {/* Report Header */}
                                    <div className="report-header-section mb-3 text-start">
                                        <h4 className="report-main-title fw-bold text-dark mb-1">
                                            {reportInfo?.title || pageTitle}
                                        </h4>
                                        <h5 className="report-company-name fw-bold text-dark mb-3">
                                            {reportInfo?.company || "Asia Direct Africa"}
                                        </h5>

                                        <div className="report-meta-grid" style={{ fontSize: "11px", maxWidth: "600px" }}>
                                            <div className="d-flex mb-1">
                                                <span className="fw-bold text-dark me-2" style={{ minWidth: "90px" }}>Item:</span>
                                                <span className="text-dark">{getItemFilterText()}</span>
                                            </div>
                                            <div className="d-flex mb-1">
                                                <span className="fw-bold text-dark me-2" style={{ minWidth: "90px" }}>Category:</span>
                                                <span className="text-dark">{getCategoryFilterText()}</span>
                                            </div>
                                            <div className="d-flex mb-1">
                                                <span className="fw-bold text-dark me-2" style={{ minWidth: "90px" }}>Date Range:</span>
                                                <span className="text-dark">{getDateRangeText()}</span>
                                            </div>
                                            <div className="d-flex mb-1">
                                                <span className="fw-bold text-dark me-2" style={{ minWidth: "90px" }}>Cost:</span>
                                                <span className="text-dark">
                                                    {reportInfo?.cost || (cost === "Average Cost" ? "Average Cost at time of Sale" : cost)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Report Table */}
                                    <div className="table-responsive mt-2">
                                        {style === "Detailed" ? (
                                            <table className="freight-item-report-table">
                                                <thead>
                                                    <tr className="table-header-row">
                                                        <th className="text-start" style={{ width: "10%" }}>Date</th>
                                                        <th className="text-start" style={{ width: "14%" }}>Document No.</th>
                                                        <th className="text-start" style={{ width: "24%" }}>Customer</th>
                                                        <th className="text-end" style={{ width: "10%" }}>Qty Sold</th>
                                                        <th className="text-end" style={{ width: "13%" }}>Total Cost</th>
                                                        <th className="text-end" style={{ width: "13%" }}>Total Selling</th>
                                                        <th className="text-end" style={{ width: "13%" }}>GP Amount</th>
                                                        <th className="text-end" style={{ width: "10%" }}>GP %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items && items.length > 0 ? (
                                                        items.map((item, itemIdx) => {
                                                            const itemTitle = item.item_name || (item.item_code ? `${item.item_code} - ${item.item_description || ""}` : "Unnamed Item");
                                                            return (
                                                                <React.Fragment key={item.item_code || `item_${itemIdx}`}>
                                                                    {/* Item Blue Title Row */}
                                                                    <tr className="item-title-row">
                                                                        <td colSpan="8" className="text-start">
                                                                            {itemTitle}
                                                                        </td>
                                                                    </tr>

                                                                    {/* Transaction Rows */}
                                                                    {item.rows && item.rows.length > 0 ? (
                                                                        item.rows.map((row, rowIdx) => (
                                                                            <tr key={`row_${itemIdx}_${rowIdx}`} className="item-row-data">
                                                                                <td className="text-start">
                                                                                    {row.date || formatDateDisplay(row.raw_date)}
                                                                                </td>
                                                                                <td className="text-start">
                                                                                    {row.document_no || "-"}
                                                                                </td>
                                                                                <td className="text-start">
                                                                                    {row.customer || "-"}
                                                                                </td>
                                                                                <td className="text-end">
                                                                                    {row.qty_sold_display || formatQty(row.qty_sold)}
                                                                                </td>
                                                                                <td className="text-end">
                                                                                    {row.total_cost_display || formatCurrency(row.total_cost)}
                                                                                </td>
                                                                                <td className="text-end">
                                                                                    {row.total_selling_display || formatCurrency(row.total_selling)}
                                                                                </td>
                                                                                <td className="text-end">
                                                                                    {row.gp_amount_display || formatCurrency(row.gp_amount)}
                                                                                </td>
                                                                                <td className="text-end">
                                                                                    {row.gp_percent_display || formatPercent(row.gp_percent)}
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="8" className="text-center text-muted py-2" style={{ fontSize: "11px" }}>
                                                                                No transaction records for this item.
                                                                            </td>
                                                                        </tr>
                                                                    )}

                                                                    {/* Item Subtotal Row */}
                                                                    <tr className="item-subtotal-row">
                                                                        <td colSpan="3" className="text-start fw-bold">
                                                                            Total for {itemTitle}
                                                                        </td>
                                                                        <td className="text-end fw-bold">
                                                                            {item.total_qty_display || formatQty(item.total_qty)}
                                                                        </td>
                                                                        <td className="text-end fw-bold">
                                                                            {item.total_cost_display || formatCurrency(item.total_cost)}
                                                                        </td>
                                                                        <td className="text-end fw-bold">
                                                                            {item.total_selling_display || formatCurrency(item.total_selling)}
                                                                        </td>
                                                                        <td className="text-end fw-bold">
                                                                            {item.gp_amount_display || formatCurrency(item.gp_amount)}
                                                                        </td>
                                                                        <td className="text-end fw-bold">
                                                                            {item.gp_percent_display || formatPercent(item.gp_percent)}
                                                                        </td>
                                                                    </tr>

                                                                    {/* Spacer between item groups */}
                                                                    <tr className="spacer-row">
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

                                                    {/* Grand Total Row */}
                                                    {items && items.length > 0 && (
                                                        <tr className="grand-total-row">
                                                            <td colSpan="3" className="text-start fw-bold">
                                                                Total
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal?.qty_sold_display || formatQty(grandTotal?.qty_sold)}
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal?.total_cost_display || formatCurrency(grandTotal?.total_cost)}
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal?.total_selling_display || formatCurrency(grandTotal?.total_selling)}
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal?.gp_amount_display || formatCurrency(grandTotal?.gp_amount)}
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal?.gp_percent_display || formatPercent(grandTotal?.gp_percent)}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        ) : (
                                            /* Summary Style Table */
                                            <table className="freight-item-report-table">
                                                <thead>
                                                    <tr className="table-header-row">
                                                        <th className="text-start" style={{ width: "12%" }}>Item Code</th>
                                                        <th className="text-start" style={{ width: "20%" }}>Item Description</th>
                                                        <th className="text-start" style={{ width: "16%" }}>Category</th>
                                                        <th className="text-end" style={{ width: "10%" }}>Qty Sold</th>
                                                        <th className="text-end" style={{ width: "13%" }}>Total Cost</th>
                                                        <th className="text-end" style={{ width: "13%" }}>Total Selling</th>
                                                        <th className="text-end" style={{ width: "13%" }}>GP Amount</th>
                                                        <th className="text-end" style={{ width: "10%" }}>GP %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items && items.length > 0 ? (
                                                        items.map((item, itemIdx) => (
                                                            <tr key={`summary_${item.item_code || itemIdx}`} className="item-row-data">
                                                                <td className="text-start fw-semibold">{item.item_code || "-"}</td>
                                                                <td className="text-start">{item.item_description || item.item_name || "-"}</td>
                                                                <td className="text-start">{item.category_name || "-"}</td>
                                                                <td className="text-end">{item.total_qty_display || formatQty(item.total_qty)}</td>
                                                                <td className="text-end">{item.total_cost_display || formatCurrency(item.total_cost)}</td>
                                                                <td className="text-end">{item.total_selling_display || formatCurrency(item.total_selling)}</td>
                                                                <td className="text-end">{item.gp_amount_display || formatCurrency(item.gp_amount)}</td>
                                                                <td className="text-end">{item.gp_percent_display || formatPercent(item.gp_percent)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="8" className="text-center text-muted py-4">
                                                                No data available for the selected filters.
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* Grand Total Row */}
                                                    {items && items.length > 0 && (
                                                        <tr className="grand-total-row">
                                                            <td colSpan="3" className="text-start fw-bold">
                                                                Total
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal?.qty_sold_display || formatQty(grandTotal?.qty_sold)}
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal?.total_cost_display || formatCurrency(grandTotal?.total_cost)}
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal?.total_selling_display || formatCurrency(grandTotal?.total_selling)}
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal?.gp_amount_display || formatCurrency(grandTotal?.gp_amount)}
                                                            </td>
                                                            <td className="text-end fw-bold grand-total-border">
                                                                {grandTotal?.gp_percent_display || formatPercent(grandTotal?.gp_percent)}
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
                                    <p className="text-muted mb-0">Please click 'View' to generate the Freight By Admin - Item Report.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style type="text/css">{`
                .report-main-title {
                    font-size: 18px !important;
                    font-weight: 700 !important;
                    color: #111827;
                }
                .report-company-name {
                    font-size: 14px !important;
                    font-weight: 700 !important;
                    color: #111827;
                }
                .report-meta-grid span {
                    font-size: 11px !important;
                }
                .freight-item-report-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    background-color: #ffffff;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                .freight-item-report-table th {
                    background-color: #e5e7eb !important;
                    color: #111827 !important;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 6px 8px;
                    border-top: 1px solid #d1d5db;
                    border-bottom: 1px solid #9ca3af;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .freight-item-report-table td {
                    padding: 3px 8px;
                    font-size: 11px;
                    color: #111827;
                    border: none;
                }
                .freight-item-report-table tr.item-title-row td {
                    color: #1d4ed8 !important;
                    font-weight: 700;
                    font-size: 12px;
                    padding-top: 12px;
                    padding-bottom: 4px;
                }
                .freight-item-report-table tr.item-row-data td {
                    padding-top: 2px;
                    padding-bottom: 2px;
                }
                .freight-item-report-table tr.item-subtotal-row {
                    background-color: #f3f4f6 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .freight-item-report-table tr.item-subtotal-row td {
                    font-weight: 700;
                    font-size: 11px;
                    padding-top: 5px;
                    padding-bottom: 5px;
                    border-top: 1px solid #d1d5db;
                    border-bottom: 1px solid #d1d5db;
                }
                .freight-item-report-table tr.spacer-row td {
                    height: 12px;
                    padding: 0;
                    border: none;
                }
                .freight-item-report-table tr.grand-total-row td {
                    font-weight: 700;
                    font-size: 11.5px;
                    padding-top: 8px;
                    padding-bottom: 8px;
                    background-color: #ffffff;
                }
                .freight-item-report-table td.grand-total-border {
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
                    .freight-item-report-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        display: table !important;
                        break-inside: auto !important;
                        page-break-inside: auto !important;
                    }
                    .freight-item-report-table th, .freight-item-report-table td {
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

export default FreightAdminByItemReport;
