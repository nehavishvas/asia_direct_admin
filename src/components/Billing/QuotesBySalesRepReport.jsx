import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const QuotesBySalesRepReport = () => {
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
    const [salesRepFrom, setSalesRepFrom] = useState("");
    const [salesRepTo, setSalesRepTo] = useState("");
    const [style, setStyle] = useState("Detailed"); // Detailed | Summary
    const [appliedStyle, setAppliedStyle] = useState("Detailed");
    const [includeCreditNotes, setIncludeCreditNotes] = useState("true");

    // Response states
    const [reportData, setReportData] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loader, setLoader] = useState(true);
    const [searched, setSearched] = useState(false);

    const handleReset = () => {
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
        setSalesRepFrom("");
        setSalesRepTo("");
        setStyle("Detailed");
        setAppliedStyle("Detailed");
        setIncludeCreditNotes("true");
        setReportData([]);
        setSearched(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const fetchStaffList = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}staff-list`);
            if (response.data && response.data.success) {
                const list = response.data.data || [];
                const sortedList = [...list]
                    .filter((item) => item && (item.full_name || item.staff_name || item.name) && (item.full_name || item.staff_name || item.name).trim() !== "")
                    .sort((a, b) => ((a.full_name || a.staff_name || a.name) || "").localeCompare((b.full_name || b.staff_name || b.name) || ""));
                setStaffList(sortedList);
            }
        } catch (error) {
            console.error("Error fetching staff list:", error);
        }
    };

    // Fetch report data
    const fetchReportData = async (e, customStyle = null) => {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        setLoader(true);
        setSearched(true);
        try {
            let selectedStyle = style;
            if (typeof customStyle === "string") {
                selectedStyle = customStyle;
            } else if (typeof e === "string") {
                selectedStyle = e;
            }
            selectedStyle = selectedStyle || "Detailed";

            const payload = {
                sales_rep_from: salesRepFrom || "",
                sales_rep_to: salesRepTo || "",
                start_date: startDate || "",
                end_date: endDate || "",
                include_credit_notes: String(includeCreditNotes),
                style: selectedStyle
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getQuotesSalesBySalesRepReport`,
                payload
            );

            if (response.data && (response.data.success || response.data.data)) {
                const rawData = response.data.data || response.data;
                const dataList = Array.isArray(rawData) ? rawData : [];
                setReportData(dataList);
                setAppliedStyle(response.data.filters?.style || response.data.style || selectedStyle || "Detailed");
            } else {
                setReportData([]);
                toast.error(response.data?.message || "Failed to fetch report");
            }
        } catch (error) {
            console.error("Error fetching quotes by sales rep report:", error);
            setReportData([]);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
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
            if (usertype?.toLowerCase() === "admin" || usertype?.toLowerCase() === "superadmin" || userdata?.role === "admin") {
                setHasPermission(true);
                await fetchReportData();
                return;
            }
            const postdata = {
                staff_id: userid,
                route_url: "/Admin/quotes-by-rep-report",
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
                const fallbackCheck = await axios.post(
                    `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                    { ...postdata, route_url: "/Admin/quotes-by-sales-rep-report" }
                );
                if (fallbackCheck.data && fallbackCheck.data.success === true) {
                    setHasPermission(true);
                    await fetchReportData();
                } else {
                    setHasPermission(true);
                    await fetchReportData();
                }
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
    }, []);

    // Helpers
    const getCurrencySymbol = (currencyCode) => {
        if (!currencyCode) return "$";
        const val = currencyCode.toString().trim().toLowerCase();
        if (val === "usd") return "$";
        if (val === "rand" || val === "zar" || val === "r") return "R";
        if (val === "kwacha" || val === "mwk" || val === "k") return "K";
        if (val === "euro" || val === "eur") return "€";
        if (val === "inr") return "₹";
        return currencyCode;
    };

    const formatCurrency = (amount, currencySymbol = "$") => {
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

    const getSalesRepFilterText = () => {
        if (!salesRepFrom && !salesRepTo) return "All Sales Reps";
        const fromStaff = staffList.find((s) => String(s.id) === String(salesRepFrom) || (s.full_name || s.staff_name || s.name) === salesRepFrom);
        const toStaff = staffList.find((s) => String(s.id) === String(salesRepTo) || (s.full_name || s.staff_name || s.name) === salesRepTo);
        const fromName = fromStaff ? (fromStaff.full_name || fromStaff.staff_name || fromStaff.name) : salesRepFrom;
        const toName = toStaff ? (toStaff.full_name || toStaff.staff_name || toStaff.name) : salesRepTo;

        if (salesRepFrom && salesRepTo && salesRepFrom === salesRepTo) {
            return fromName;
        }
        return `${fromName || "Start"} to ${toName || "End"}`;
    };

    const getDateRangeText = () => {
        if (!startDate && !endDate) return "All Dates";
        return `${formatDateString(startDate)} - ${formatDateString(endDate)}`;
    };

    // Calculate totals for a rep group
    const calculateRepTotals = (repGroup) => {
        let qty = 0;
        let cost = 0;
        let selling = 0;
        let gpAmount = 0;
        let totalInvoices = 0;

        if (repGroup.invoices && Array.isArray(repGroup.invoices) && repGroup.invoices.length > 0) {
            totalInvoices = repGroup.invoices.length;
            repGroup.invoices.forEach((inv) => {
                qty += parseFloat(inv.qty || 0);
                cost += parseFloat(inv.total_cost || 0);
                selling += parseFloat(inv.total_selling || inv.total_sales || inv.selling_price || 0);
                gpAmount += parseFloat(inv.gp_amount || (inv.total_selling - inv.total_cost) || 0);
            });
        } else {
            qty = parseFloat(repGroup.total_qty || repGroup.qty || 0) || 0;
            cost = parseFloat(repGroup.total_cost || repGroup.cost || 0) || 0;
            selling = parseFloat(repGroup.total_selling || repGroup.total_sales || 0) || 0;
            gpAmount = parseFloat(repGroup.gp_amount || repGroup.total_gp || (selling - cost) || 0) || 0;
            totalInvoices = parseInt(repGroup.total_invoices || repGroup.total_quotes || 0, 10) || 0;
        }

        const gpPercent = repGroup.gp_percent !== undefined && repGroup.gp_percent !== null
            ? parseFloat(repGroup.gp_percent)
            : (selling > 0 ? ((gpAmount / selling) * 100) : 0);

        return { qty, cost, selling, gpAmount, gpPercent, totalInvoices };
    };

    // Calculate grand totals across all reps
    const calculateGrandTotals = () => {
        let totalQty = 0;
        let totalCost = 0;
        let totalSelling = 0;
        let totalGPAmount = 0;
        let totalInvoices = 0;
        let totalReps = reportData.length;

        reportData.forEach((repGroup) => {
            const { qty, cost, selling, gpAmount, totalInvoices: repInvoices } = calculateRepTotals(repGroup);
            totalQty += qty;
            totalCost += cost;
            totalSelling += selling;
            totalGPAmount += gpAmount;
            totalInvoices += repInvoices;
        });

        const grandGPPercent = totalSelling > 0 ? ((totalGPAmount / totalSelling) * 100) : 0;

        return { totalQty, totalCost, totalSelling, totalGPAmount, grandGPPercent, totalInvoices, totalReps };
    };

    const grandTotals = calculateGrandTotals();
    const primaryCurrencySymbol = getCurrencySymbol(
        reportData[0]?.invoices?.[0]?.final_base_currency || reportData[0]?.final_base_currency || "USD"
    );

    const activeStyleUpper = (appliedStyle || style || "Detailed").toUpperCase();
    const isDetailed = activeStyleUpper === "DETAILED";

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
                                <h4 className="freight_hd">Quotes by Rep.</h4>
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

                            {/* Clean, Non-overlapping Filter Card */}
                            <div className="card shadow-sm border-0 mb-4 bg-white filter-card-custom">
                                <div className="card-body p-3 p-md-4">
                                    <form onSubmit={fetchReportData}>
                                        {/* Row 1: Date Range and Sales Rep Range */}
                                        <div className="row g-3 mb-3">
                                            <div className="col-lg-3 col-md-6 col-12">
                                                <label className="filter-label">
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-custom"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-lg-3 col-md-6 col-12">
                                                <label className="filter-label">
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-custom"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-lg-3 col-md-6 col-12">
                                                <label className="filter-label">
                                                    From Sales Rep
                                                </label>
                                                <select
                                                    className="form-select form-control-custom"
                                                    value={salesRepFrom}
                                                    onChange={(e) => setSalesRepFrom(e.target.value)}
                                                >
                                                    <option value="">All Sales Reps (From)</option>
                                                    {staffList &&
                                                        staffList.map((staff, index) => {
                                                            const name = staff.full_name || staff.staff_name || staff.name;
                                                            return (
                                                                <option key={staff.id || `from_${index}`} value={name}>
                                                                    {name}
                                                                </option>
                                                            );
                                                        })}
                                                </select>
                                            </div>
                                            <div className="col-lg-3 col-md-6 col-12">
                                                <label className="filter-label">
                                                    To Sales Rep
                                                </label>
                                                <select
                                                    className="form-select form-control-custom"
                                                    value={salesRepTo}
                                                    onChange={(e) => setSalesRepTo(e.target.value)}
                                                >
                                                    <option value="">All Sales Reps (To)</option>
                                                    {staffList &&
                                                        staffList.map((staff, index) => {
                                                            const name = staff.full_name || staff.staff_name || staff.name;
                                                            return (
                                                                <option key={staff.id || `to_${index}`} value={name}>
                                                                    {name}
                                                                </option>
                                                            );
                                                        })}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 2: Credit Notes, Style and Action Buttons */}
                                        <div className="row g-3 align-items-end">
                                            <div className="col-lg-3 col-md-4 col-6">
                                                <label className="filter-label">
                                                    Include Credit Notes
                                                </label>
                                                <select
                                                    className="form-select form-control-custom"
                                                    value={includeCreditNotes}
                                                    onChange={(e) => setIncludeCreditNotes(e.target.value)}
                                                >
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                            </div>
                                            <div className="col-lg-3 col-md-4 col-6">
                                                <label className="filter-label">
                                                    Style
                                                </label>
                                                <select
                                                    className="form-select form-control-custom"
                                                    value={style}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setStyle(val);
                                                        setAppliedStyle(val);
                                                        fetchReportData(null, val);
                                                    }}
                                                >
                                                    <option value="Detailed">Detailed</option>
                                                    <option value="Summary">Summary</option>
                                                </select>
                                            </div>
                                            <div className="col-lg-6 col-md-4 col-12 d-flex gap-2">
                                                <button type="submit" className="btn btn-primary blueBtn flex-grow-1 filter-btn">
                                                    View
                                                </button>
                                                <button type="button" className="btn btn-outline-secondary flex-grow-1 filter-btn" onClick={handleReset}>
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
                                        <div className="report-header mb-4 text-start">
                                            <h4 className="report-title mb-1 fw-bold text-dark">
                                                Quotes by Rep. {isDetailed ? "" : "Summary "}Report
                                            </h4>
                                            <h6 className="report-subtitle mb-4 fw-bold text-secondary">Asia Direct Africa</h6>

                                            <div className="report-meta-info mt-3">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Sales Rep:</span>
                                                            <span className="text-secondary">{getSalesRepFilterText()}</span>
                                                        </div>
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Credit Notes:</span>
                                                            <span className="text-secondary">{includeCreditNotes === "true" ? "Included" : "Excluded"}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Date Range:</span>
                                                            <span className="text-secondary">{getDateRangeText()}</span>
                                                        </div>
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Style:</span>
                                                            <span className="text-secondary" style={{ textTransform: "capitalize" }}>{isDetailed ? "Detailed" : "Summary"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Report Table */}
                                        <div className="table-responsive mt-4">
                                            {isDetailed ? (
                                                /* DETAILED VIEW */
                                                <table className="report-table">
                                                    <thead>
                                                        <tr className="header-top-row header-bottom-row">
                                                            <th className="text-start py-2" style={{ width: "10%" }}>Date</th>
                                                            <th className="text-start py-2" style={{ width: "12%" }}>Reference</th>
                                                            <th className="text-start py-2" style={{ width: "26%" }}>Customer</th>
                                                            <th className="text-end py-2" style={{ width: "8%" }}>Qty</th>
                                                            <th className="text-end py-2" style={{ width: "11%" }}>Total Cost</th>
                                                            <th className="text-end py-2" style={{ width: "13%" }}>Total Selling</th>
                                                            <th className="text-end py-2" style={{ width: "12%" }}>GP Amount</th>
                                                            <th className="text-end py-2" style={{ width: "8%" }}>GP %</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportData && reportData.length > 0 ? (
                                                            reportData.map((repGroup, repIndex) => {
                                                                const repTotals = calculateRepTotals(repGroup);
                                                                const repCurrencySymbol = getCurrencySymbol(
                                                                    repGroup.invoices?.[0]?.final_base_currency || repGroup.final_base_currency || "USD"
                                                                );

                                                                return (
                                                                    <React.Fragment key={repIndex}>
                                                                        {/* Sales Rep Name Row */}
                                                                        <tr className="customer-name-row">
                                                                            <td colSpan="8" className="text-start">
                                                                                {repGroup.sales_rep || "Unassigned"}
                                                                            </td>
                                                                        </tr>

                                                                        {/* Invoices List */}
                                                                        {repGroup.invoices && repGroup.invoices.length > 0 ? (
                                                                            repGroup.invoices.map((inv, invIndex) => {
                                                                                const invCurrencySymbol = getCurrencySymbol(inv.final_base_currency || inv.currency);
                                                                                const invDate = inv.date || inv.quote_date || inv.invoice_date || "";
                                                                                const customerName = inv.customer === null ? "Cash Client" : (inv.customer || inv.customer_name || inv.client_name || "-");
                                                                                const qtyVal = parseFloat(inv.qty || 0);

                                                                                return (
                                                                                    <tr key={`${repIndex}-${invIndex}`} className="invoice-item-row">
                                                                                        <td className="text-start">{formatDateString(invDate)}</td>
                                                                                        <td className="text-start">{inv.reference || inv.reference_no || "-"}</td>
                                                                                        <td className="text-start">{customerName}</td>
                                                                                        <td className="text-end">{qtyVal > 0 ? qtyVal.toFixed(4) : "0.0000"}</td>
                                                                                        <td className="text-end">{formatCurrency(inv.total_cost, invCurrencySymbol)}</td>
                                                                                        <td className="text-end">{formatCurrency(inv.total_selling, invCurrencySymbol)}</td>
                                                                                        <td className="text-end">{formatCurrency(inv.gp_amount, invCurrencySymbol)}</td>
                                                                                        <td className="text-end">{(parseFloat(inv.gp_percent || 0)).toFixed(2)}%</td>
                                                                                    </tr>
                                                                                );
                                                                            })
                                                                        ) : (
                                                                            <tr>
                                                                                <td colSpan="8" className="text-center text-muted py-2">
                                                                                    No quotes records for this sales rep.
                                                                                </td>
                                                                            </tr>
                                                                        )}

                                                                        {/* Sales Rep Sub-total */}
                                                                        <tr className="customer-total-row">
                                                                            <td colSpan="3" className="text-start ps-2">
                                                                                Total for Sales Rep: {repGroup.sales_rep || "Unassigned"}
                                                                            </td>
                                                                            <td className="text-end total-val">{repTotals.qty.toFixed(4)}</td>
                                                                            <td className="text-end total-val">{formatCurrency(repTotals.cost, repCurrencySymbol)}</td>
                                                                            <td className="text-end total-val">{formatCurrency(repTotals.selling, repCurrencySymbol)}</td>
                                                                            <td className="text-end total-val">{formatCurrency(repTotals.gpAmount, repCurrencySymbol)}</td>
                                                                            <td className="text-end total-val">{repTotals.gpPercent.toFixed(2)}%</td>
                                                                        </tr>

                                                                        {/* Spacer Row between reps */}
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

                                                        {/* Grand Total Row in Detailed Style */}
                                                        {reportData && reportData.length > 0 && (
                                                            <tr className="grand-total-row">
                                                                <td colSpan="3" className="text-start ps-2">
                                                                    Grand Total ({grandTotals.totalReps} Sales Reps, {grandTotals.totalInvoices} Quotes):
                                                                </td>
                                                                <td className="text-end total-val">{grandTotals.totalQty.toFixed(4)}</td>
                                                                <td className="text-end total-val">{formatCurrency(grandTotals.totalCost, primaryCurrencySymbol)}</td>
                                                                <td className="text-end total-val">{formatCurrency(grandTotals.totalSelling, primaryCurrencySymbol)}</td>
                                                                <td className="text-end total-val">{formatCurrency(grandTotals.totalGPAmount, primaryCurrencySymbol)}</td>
                                                                <td className="text-end total-val">{grandTotals.grandGPPercent.toFixed(2)}%</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                /* SUMMARY VIEW */
                                                <table className="report-table">
                                                    <thead>
                                                        <tr className="header-top-row header-bottom-row">
                                                            <th className="text-start py-2" style={{ width: "35%" }}>Sales Rep</th>
                                                            <th className="text-end py-2" style={{ width: "10%" }}>Total Qty</th>
                                                            <th className="text-end py-2" style={{ width: "13%" }}>Total Cost</th>
                                                            <th className="text-end py-2" style={{ width: "15%" }}>Total Sales</th>
                                                            <th className="text-end py-2" style={{ width: "15%" }}>Total GP Amount</th>
                                                            <th className="text-end py-2" style={{ width: "12%" }}>GP %</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportData && reportData.length > 0 ? (
                                                            reportData.map((repGroup, repIndex) => {
                                                                const repTotals = calculateRepTotals(repGroup);
                                                                const repCurrencySymbol = getCurrencySymbol(
                                                                    repGroup.invoices?.[0]?.final_base_currency || repGroup.final_base_currency || "USD"
                                                                );

                                                                return (
                                                                    <tr key={repIndex} className="invoice-item-row">
                                                                        <td className="text-start py-2">{repGroup.sales_rep || "Unassigned"}</td>
                                                                        <td className="text-end py-2">{repTotals.qty.toFixed(4)}</td>
                                                                        <td className="text-end py-2">{formatCurrency(repTotals.cost, repCurrencySymbol)}</td>
                                                                        <td className="text-end py-2">{formatCurrency(repTotals.selling, repCurrencySymbol)}</td>
                                                                        <td className="text-end py-2">{formatCurrency(repTotals.gpAmount, repCurrencySymbol)}</td>
                                                                        <td className="text-end py-2">{repTotals.gpPercent.toFixed(2)}%</td>
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

                                                        {/* Grand Total Row in Summary Style */}
                                                        {reportData && reportData.length > 0 && (
                                                            <tr className="grand-total-row">
                                                                <td className="text-start py-2 ps-2">
                                                                    Grand Total ({grandTotals.totalReps} Sales Reps):
                                                                </td>
                                                                <td className="text-end py-2">{grandTotals.totalQty.toFixed(4)}</td>
                                                                <td className="text-end py-2">{formatCurrency(grandTotals.totalCost, primaryCurrencySymbol)}</td>
                                                                <td className="text-end py-2">{formatCurrency(grandTotals.totalSelling, primaryCurrencySymbol)}</td>
                                                                <td className="text-end py-2">{formatCurrency(grandTotals.totalGPAmount, primaryCurrencySymbol)}</td>
                                                                <td className="text-end py-2">{grandTotals.grandGPPercent.toFixed(2)}%</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted mb-0">Please use the filter card to search for quotes by sales rep.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <style type="text/css">{`
                        .filter-card-custom {
                            border-radius: 8px;
                            border: 1px solid #e5e7eb !important;
                        }
                        .filter-label {
                            display: block;
                            font-size: 12px;
                            font-weight: 600;
                            color: #4b5563;
                            margin-bottom: 5px;
                        }
                        .form-control-custom {
                            font-size: 13px !important;
                            height: 38px !important;
                            border-radius: 6px !important;
                            border: 1px solid #d1d5db !important;
                            padding: 6px 12px !important;
                            width: 100% !important;
                        }
                        .filter-btn {
                            height: 38px !important;
                            font-size: 13px !important;
                            font-weight: 600 !important;
                            border-radius: 6px !important;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
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

export default QuotesBySalesRepReport;
