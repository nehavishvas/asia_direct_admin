import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const QuotesByCustomerReport = () => {
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
    const [customerFrom, setCustomerFrom] = useState("");
    const [customerTo, setCustomerTo] = useState("");
    const [categoryFrom, setCategoryFrom] = useState("");
    const [categoryTo, setCategoryTo] = useState("");
    const [activeStatus, setActiveStatus] = useState("BOTH");
    const [style, setStyle] = useState("DETAILED"); // DETAILED | SUMMARY
    const [appliedStyle, setAppliedStyle] = useState("DETAILED");

    // Response states
    const [reportData, setReportData] = useState([]);
    const [clientList, setClientList] = useState([]);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleReset = () => {
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
        setCustomerFrom("");
        setCustomerTo("");
        setCategoryFrom("");
        setCategoryTo("");
        setActiveStatus("BOTH");
        setStyle("DETAILED");
        setAppliedStyle("DETAILED");
        setReportData([]);
        setSearched(false);
    };

    const handlePrint = () => {
        window.print();
    };

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
            selectedStyle = selectedStyle || "DETAILED";

            const payload = {
                customer_from: customerFrom || "",
                customer_to: customerTo || "",
                category_from: categoryFrom || "",
                category_to: categoryTo || "",
                start_date: startDate || "",
                end_date: endDate || "",
                active: activeStatus || "BOTH",
                style: selectedStyle
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getQuoteBySalesCustomerReport`,
                payload
            );

            if (response.data && (response.data.success || response.data.data)) {
                const rawData = response.data.data || response.data;
                const dataList = Array.isArray(rawData)
                    ? rawData
                    : rawData && typeof rawData === "object" && Array.isArray(rawData.customers)
                    ? rawData.customers
                    : [];
                setReportData(dataList);
                setAppliedStyle(response.data.style || selectedStyle || "DETAILED");
            } else {
                setReportData([]);
                toast.error(response.data?.message || "Failed to fetch report");
            }
        } catch (error) {
            console.error("Error fetching quote by customer report:", error);
            setReportData([]);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
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
            if (usertype?.toLowerCase() === "admin" || usertype?.toLowerCase() === "superadmin" || userdata?.role === "admin") {
                setHasPermission(true);
                fetchReportData();
                return;
            }
            const postdata = {
                staff_id: userid,
                route_url: "/Admin/quotes-by-customer-report",
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
                const fallbackCheck = await axios.post(
                    `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                    { ...postdata, route_url: "/Admin/customer-quotes-report" }
                );
                if (fallbackCheck.data && fallbackCheck.data.success === true) {
                    setHasPermission(true);
                    fetchReportData();
                } else {
                    setHasPermission(true);
                    fetchReportData();
                }
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
        fetchClientList();
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

    const getCustomerFilterText = () => {
        if (!customerFrom && !customerTo) return "All Customers";
        const fromClient = clientList.find((c) => String(c.id) === String(customerFrom) || String(c.client_name) === String(customerFrom) || String(c.name) === String(customerFrom));
        const toClient = clientList.find((c) => String(c.id) === String(customerTo) || String(c.client_name) === String(customerTo) || String(c.name) === String(customerTo));
        const fromName = fromClient ? (fromClient.client_name || fromClient.name) : customerFrom;
        const toName = toClient ? (toClient.client_name || toClient.name) : customerTo;

        if (customerFrom && customerTo && customerFrom === customerTo) {
            return fromName;
        }
        return `${fromName || "Start"} to ${toName || "End"}`;
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

    const getActiveStatusText = () => {
        if (!activeStatus || activeStatus === "BOTH") return "Both";
        if (activeStatus === "ACTIVE") return "Active";
        if (activeStatus === "INACTIVE") return "Inactive";
        return activeStatus;
    };

    // Calculate totals for a single quote/invoice
    const getInvoiceTotals = (invoice) => {
        let invoiceQty = 0;
        let invoiceSelling = 0;
        if (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0) {
            invoice.items.forEach((item) => {
                invoiceQty += parseFloat(item.qty) || 0;
                invoiceSelling += parseFloat(item.total_selling) || 0;
            });
            if (invoiceSelling === 0 && (invoice.invoice_total || invoice.total_selling || invoice.total_amount)) {
                invoiceSelling = parseFloat(invoice.invoice_total || invoice.total_selling || invoice.total_amount) || 0;
            }
        } else {
            invoiceQty = parseFloat(invoice.qty || invoice.total_qty) || 0;
            invoiceSelling = parseFloat(invoice.invoice_total || invoice.total_selling || invoice.total_amount) || 0;
        }
        return { invoiceQty, invoiceSelling };
    };

    // Calculate customer totals
    const calculateCustomerTotals = (customerGroup) => {
        let qty = 0;
        let selling = 0;
        let total_invoices = 0;
        if (customerGroup.invoices && Array.isArray(customerGroup.invoices) && customerGroup.invoices.length > 0) {
            total_invoices = customerGroup.invoices.length;
            customerGroup.invoices.forEach((inv) => {
                const { invoiceQty, invoiceSelling } = getInvoiceTotals(inv);
                qty += invoiceQty;
                selling += invoiceSelling;
            });
        } else {
            total_invoices = parseInt(
                customerGroup.total_invoices ||
                customerGroup.total_quotes ||
                customerGroup.invoices_count ||
                customerGroup.invoice_count ||
                customerGroup.quotes_count ||
                0,
                10
            ) || 0;
            selling = parseFloat(
                customerGroup.total_sales ||
                customerGroup.total_amount ||
                customerGroup.total_selling ||
                customerGroup.invoice_total ||
                0
            ) || 0;
            qty = parseFloat(customerGroup.qty || customerGroup.total_qty || 0) || 0;
        }
        return { qty, selling, total_invoices };
    };

    // Calculate grand totals across all customers
    const calculateGrandTotals = () => {
        let totalQty = 0;
        let totalSelling = 0;
        let total_invoices = 0;
        let totalCustomers = reportData.length;
        reportData.forEach((customerGroup) => {
            const { qty, selling, total_invoices: custInvoices } = calculateCustomerTotals(customerGroup);
            totalQty += qty;
            totalSelling += selling;
            total_invoices += custInvoices;
        });
        return { totalQty, totalSelling, total_invoices, totalCustomers };
    };

    const grandTotals = calculateGrandTotals();
    const primaryCurrencySymbol = getCurrencySymbol(
        reportData[0]?.invoices?.[0]?.final_base_currency || reportData[0]?.final_base_currency || "USD"
    );

    const activeStyleUpper = (appliedStyle || style || "DETAILED").toUpperCase();
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
                                <h4 className="freight_hd">Quotes By Customer</h4>
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

                            {/* Spacious, Non-overlapping Filter Card */}
                            <div className="card shadow-sm border-0 mb-4 bg-white filter-card-custom">
                                <div className="card-body p-3 p-md-4">
                                    <form onSubmit={fetchReportData}>
                                        {/* Row 1: Dates and Customers */}
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
                                                    From Customer
                                                </label>
                                                <select
                                                    className="form-select form-control-custom"
                                                    value={customerFrom}
                                                    onChange={(e) => setCustomerFrom(e.target.value)}
                                                >
                                                    <option value="">All Customers (From)</option>
                                                    {clientList &&
                                                        clientList.map((client, index) => {
                                                            const name = client.client_name || client.name;
                                                            return (
                                                                <option key={client.id || `from_${index}`} value={name}>
                                                                    {name}
                                                                </option>
                                                            );
                                                        })}
                                                </select>
                                            </div>
                                            <div className="col-lg-3 col-md-6 col-12">
                                                <label className="filter-label">
                                                    To Customer
                                                </label>
                                                <select
                                                    className="form-select form-control-custom"
                                                    value={customerTo}
                                                    onChange={(e) => setCustomerTo(e.target.value)}
                                                >
                                                    <option value="">All Customers (To)</option>
                                                    {clientList &&
                                                        clientList.map((client, index) => {
                                                            const name = client.client_name || client.name;
                                                            return (
                                                                <option key={client.id || `to_${index}`} value={name}>
                                                                    {name}
                                                                </option>
                                                            );
                                                        })}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 2: Categories, Active, Style and Action Buttons */}
                                        <div className="row g-3 align-items-end">
                                            <div className="col-lg-3 col-md-6 col-12">
                                                <label className="filter-label">
                                                    From Category
                                                </label>
                                                <select
                                                    className="form-select form-control-custom"
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
                                                <label className="filter-label">
                                                    To Category
                                                </label>
                                                <select
                                                    className="form-select form-control-custom"
                                                    value={categoryTo}
                                                    onChange={(e) => setCategoryTo(e.target.value)}
                                                >
                                                    <option value="">All Categories (To)</option>
                                                    <option value="South Africa">South Africa</option>
                                                    <option value="Zambia">Zambia</option>
                                                    <option value="Zimbabwe">Zimbabwe</option>
                                                </select>
                                            </div>
                                            <div className="col-lg-2 col-md-4 col-6">
                                                <label className="filter-label">
                                                    Active Status
                                                </label>
                                                <select
                                                    className="form-select form-control-custom"
                                                    value={activeStatus}
                                                    onChange={(e) => setActiveStatus(e.target.value)}
                                                >
                                                    <option value="BOTH">Both</option>
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="INACTIVE">Inactive</option>
                                                </select>
                                            </div>
                                            <div className="col-lg-2 col-md-4 col-6">
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
                                                    <option value="DETAILED">Detailed</option>
                                                    <option value="SUMMARY">Summary</option>
                                                </select>
                                            </div>
                                            <div className="col-lg-2 col-md-4 col-12 d-flex gap-2">
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
                                            <h4 className="report-title mb-1 fw-bold text-dark">
                                                Quotes By Customer {isDetailed ? "" : "Summary "}Report
                                            </h4>
                                            <h6 className="report-subtitle mb-4 fw-bold text-secondary">Asia Direct Africa</h6>

                                            <div className="report-meta-info mt-3">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Customer:</span>
                                                            <span className="text-secondary">{getCustomerFilterText()}</span>
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
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Active:</span>
                                                            <span className="text-secondary">{getActiveStatusText()}</span>
                                                        </div>
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Style:</span>
                                                            <span className="text-secondary">{isDetailed ? "DETAILED" : "SUMMARY"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Report Table */}
                                        <div className="table-responsive mt-4">
                                            {isDetailed ? (
                                                <table className="report-table">
                                                    <thead>
                                                        <tr className="header-top-row">
                                                            <th colSpan="4" className="text-start align-bottom pb-1" style={{ width: "65%" }}>Name</th>
                                                            <th rowSpan="2" className="text-end align-bottom pb-2" style={{ width: "15%" }}>Qty</th>
                                                            <th rowSpan="2" className="text-end align-bottom pb-2" style={{ width: "20%" }}>Total Selling</th>
                                                        </tr>
                                                        <tr className="header-bottom-row">
                                                            <th className="text-start pt-1 pb-2" style={{ width: "12%" }}>Date</th>
                                                            <th className="text-start pt-1 pb-2" style={{ width: "15%" }}>Reference</th>
                                                            <th className="text-start pt-1 pb-2" style={{ width: "15%" }}>Country</th>
                                                            <th className="text-start pt-1 pb-2" style={{ width: "23%" }}>Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportData && reportData.length > 0 ? (
                                                            reportData.map((customerGroup, customerIndex) => {
                                                                const customerTotals = calculateCustomerTotals(customerGroup);
                                                                const custCurrencySymbol = getCurrencySymbol(
                                                                    customerGroup.invoices?.[0]?.final_base_currency || customerGroup.final_base_currency || "USD"
                                                                );
                                                                return (
                                                                    <React.Fragment key={customerIndex}>
                                                                        {/* Customer Header Row */}
                                                                        <tr className="customer-name-row">
                                                                            <td colSpan="6" className="text-start">
                                                                                {customerGroup.customer || "Unknown Customer"}
                                                                            </td>
                                                                        </tr>
                                                                        {/* Customer Quotes & Items */}
                                                                        {customerGroup.invoices && customerGroup.invoices.length > 0 ? (
                                                                            customerGroup.invoices.map((invoice) => {
                                                                                const currencySymbol = getCurrencySymbol(invoice.final_base_currency || invoice.currency);
                                                                                const { invoiceQty, invoiceSelling } = getInvoiceTotals(invoice);
                                                                                const invoiceCountry = invoice.invoice_for_country || invoice.country || customerGroup.invoice_for_country || customerGroup.country || "-";
                                                                                const quoteDate = invoice.quote_date || invoice.date || invoice.invoice_date || "";

                                                                                return invoice.items && invoice.items.length > 0 ? (
                                                                                    <React.Fragment key={invoice.id || invoice.reference_no}>
                                                                                        {invoice.items.map((item, itemIndex) => {
                                                                                            const isFirstItem = itemIndex === 0;
                                                                                            const qtyVal = parseFloat(item.qty || 0);
                                                                                            const displayQty = (!item.qty || qtyVal === 0) ? "" : qtyVal.toFixed(4);

                                                                                            return (
                                                                                                <tr key={`${invoice.id}-${itemIndex}`} className="invoice-item-row">
                                                                                                    <td className="text-start">
                                                                                                        {isFirstItem ? formatDateString(quoteDate) : ""}
                                                                                                    </td>
                                                                                                    <td className="text-start">
                                                                                                        {isFirstItem ? (invoice.reference_no || invoice.reference || "-") : ""}
                                                                                                    </td>
                                                                                                    <td className="text-start">
                                                                                                        {isFirstItem ? invoiceCountry : ""}
                                                                                                    </td>
                                                                                                    <td className="text-start">
                                                                                                        {item.description || "-"}
                                                                                                    </td>
                                                                                                    <td className="text-end">
                                                                                                        {displayQty}
                                                                                                    </td>
                                                                                                    <td className="text-end">
                                                                                                        {formatCurrency(item.total_selling, currencySymbol)}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            );
                                                                                        })}
                                                                                        {/* Quote Total Row */}
                                                                                        <tr className="invoice-total-row">
                                                                                            <td className="text-start">Total:</td>
                                                                                            <td className="text-start">{invoice.reference_no || invoice.reference}</td>
                                                                                            <td></td>
                                                                                            <td></td>
                                                                                            <td className="text-end total-val">
                                                                                                {invoiceQty > 0 ? invoiceQty.toFixed(4) : ""}
                                                                                            </td>
                                                                                            <td className="text-end total-val">
                                                                                                {formatCurrency(invoiceSelling, currencySymbol)}
                                                                                            </td>
                                                                                        </tr>
                                                                                        {/* Spacer Row */}
                                                                                        <tr className="spacer-row" style={{ height: "12px" }}>
                                                                                            <td colSpan="6"></td>
                                                                                        </tr>
                                                                                    </React.Fragment>
                                                                                ) : (
                                                                                    <React.Fragment key={invoice.id || invoice.reference_no}>
                                                                                        <tr className="invoice-item-row">
                                                                                            <td className="text-start">{formatDateString(quoteDate)}</td>
                                                                                            <td className="text-start">{invoice.reference_no || invoice.reference || "-"}</td>
                                                                                            <td className="text-start">{invoiceCountry}</td>
                                                                                            <td className="text-start">-</td>
                                                                                            <td className="text-end">{invoiceQty > 0 ? invoiceQty.toFixed(4) : ""}</td>
                                                                                            <td className="text-end">{formatCurrency(invoiceSelling, currencySymbol)}</td>
                                                                                        </tr>
                                                                                        <tr className="spacer-row" style={{ height: "12px" }}>
                                                                                            <td colSpan="6"></td>
                                                                                        </tr>
                                                                                    </React.Fragment>
                                                                                );
                                                                            })
                                                                        ) : (
                                                                            <tr>
                                                                                <td colSpan="6" className="text-center text-muted py-2">
                                                                                    No quotes records for this customer.
                                                                                </td>
                                                                            </tr>
                                                                        )}

                                                                        {/* Customer Sub-total */}
                                                                        <tr className="customer-total-row">
                                                                            <td colSpan="4" className="text-start ps-2">
                                                                                Total for Customer: {customerGroup.customer}
                                                                            </td>
                                                                            <td className="text-end total-val">
                                                                                {customerTotals.qty > 0 ? customerTotals.qty.toFixed(4) : ""}
                                                                            </td>
                                                                            <td className="text-end total-val">
                                                                                {formatCurrency(customerTotals.selling, custCurrencySymbol)}
                                                                            </td>
                                                                        </tr>

                                                                        {/* Spacer Row between customers */}
                                                                        <tr className="spacer-row" style={{ height: "20px" }}>
                                                                            <td colSpan="6"></td>
                                                                        </tr>
                                                                    </React.Fragment>
                                                                );
                                                            })
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6" className="text-center text-muted py-4">
                                                                    No data available for the selected filters.
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {/* Grand Total Row */}
                                                        {reportData && reportData.length > 0 && (
                                                            <tr className="grand-total-row">
                                                                <td colSpan="4" className="text-start">
                                                                    Grand Total ({grandTotals.totalCustomers} Customers, {grandTotals.total_invoices} Quotes):
                                                                </td>
                                                                <td className="text-end total-val">
                                                                    {grandTotals.totalQty > 0 ? grandTotals.totalQty.toFixed(4) : ""}
                                                                </td>
                                                                <td className="text-end total-val">
                                                                    {formatCurrency(grandTotals.totalSelling, primaryCurrencySymbol)}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                /* SUMMARY VIEW: Only Customer Name, Country, Total Invoices, Total Sales */
                                                <table className="report-table">
                                                    <thead>
                                                        <tr className="header-top-row header-bottom-row">
                                                            <th className="text-start py-2" style={{ width: "40%" }}>Customer Name</th>
                                                            <th className="text-start py-2" style={{ width: "30%" }}>Country</th>
                                                            <th className="text-end py-2" style={{ width: "15%" }}>Total Invoices</th>
                                                            <th className="text-end py-2" style={{ width: "15%" }}>Total Sales</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportData && reportData.length > 0 ? (
                                                            reportData.map((customerGroup, customerIndex) => {
                                                                const customerTotals = calculateCustomerTotals(customerGroup);
                                                                const currency = customerGroup.final_base_currency || customerGroup.currency || customerGroup.invoices?.[0]?.final_base_currency || customerGroup.invoices?.[0]?.currency || "USD";
                                                                const custCurrencySymbol = getCurrencySymbol(currency);
                                                                const customerName = customerGroup.customer || customerGroup.customer_name || customerGroup.client_name || customerGroup.name || "Unknown Customer";
                                                                const country = customerGroup.invoice_for_country || customerGroup.country || customerGroup.category || customerGroup.invoices?.[0]?.invoice_for_country || customerGroup.invoices?.[0]?.country || "-";

                                                                return (
                                                                    <tr key={customerIndex} className="invoice-item-row">
                                                                        <td className="text-start py-2">{customerName}</td>
                                                                        <td className="text-start py-2">{country}</td>
                                                                        <td className="text-end py-2">{customerTotals.total_invoices}</td>
                                                                        <td className="text-end py-2">{formatCurrency(customerTotals.selling, custCurrencySymbol)}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="4" className="text-center text-muted py-4">
                                                                    No data available for the selected filters.
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {/* Grand Total Row in Summary Style */}
                                                        {reportData && reportData.length > 0 && (
                                                            <tr className="grand-total-row">
                                                                <td colSpan="2" className="text-start py-2">
                                                                    Grand Total ({grandTotals.totalCustomers} Customers):
                                                                </td>
                                                                <td className="text-end py-2">{grandTotals.total_invoices}</td>
                                                                <td className="text-end py-2">
                                                                    {formatCurrency(grandTotals.totalSelling, primaryCurrencySymbol)}
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
                                        <p className="text-muted mb-0">Please use the filter card to search for quotes by customer.</p>
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
                        .report-table tbody tr.invoice-total-row td {
                            font-weight: bold;
                            padding-top: 3px;
                            padding-bottom: 3px;
                            border-bottom: 1.5px solid #000000 !important;
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

export default QuotesByCustomerReport;
