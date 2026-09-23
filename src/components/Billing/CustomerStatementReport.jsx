import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const COMPANY_INFO = {
    name: "ASIA DIRECT AFRICA",
    vat_no: "4740280377",
    postal_address_lines: [
        "Unit 4, Gleneagles Office Park",
        "39 Koorsboom Ave",
        "Glen Marais",
        "South Africa",
        "1619",
    ],
    physical_address_lines: [
        "Unit 4, Gleneagles Office Park",
        "39 Koorsboom Ave",
        "Glen Marais",
        "South Africa",
        "1619",
    ],
};

const CustomerStatementReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
    const userid = userdata?.id;
    const usertype = userdata?.user_type;
    const [hasPermission, setHasPermission] = useState(null);

    // Default Date Helpers (YYYY-MM-DD for input fields)
    const getTodayDateString = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    // 30 days ago from today
    const getThirtyDaysAgoDateString = () => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const formatToDDMMYYYY = (dateStr) => {
        if (!dateStr) return "";
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr.replace(/-/g, "/");
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                // YYYY-MM-DD or YYYY/MM/DD -> DD/MM/YYYY
                return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
            }
            if (parts[2].length === 4) {
                // DD-MM-YYYY or MM-DD-YYYY
                return `${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[2]}`;
            }
        }
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    // Filter states
    const [customerFrom, setCustomerFrom] = useState(location.state?.customerFrom || "All");
    const [customerTo, setCustomerTo] = useState(location.state?.customerTo || "All");
    const [active, setActive] = useState(location.state?.active || "Both");
    const [categoryFrom, setCategoryFrom] = useState(location.state?.categoryFrom || "All");
    const [categoryTo, setCategoryTo] = useState(location.state?.categoryTo || "All");
    const [dateFrom, setDateFrom] = useState(location.state?.dateFrom || getThirtyDaysAgoDateString());
    const [dateTo, setDateTo] = useState(location.state?.dateTo || getTodayDateString());
    const [statementDate, setStatementDate] = useState(location.state?.statementDate || getTodayDateString());
    const [showBalanceBroughtForward, setShowBalanceBroughtForward] = useState(
        location.state?.showBalanceBroughtForward !== undefined ? location.state.showBalanceBroughtForward : true
    );
    const [excludeFullyAllocatedInvoices, setExcludeFullyAllocatedInvoices] = useState(
        location.state?.excludeFullyAllocatedInvoices || false
    );
    const [showDetail, setShowDetail] = useState(location.state?.showDetail || false);
    const [useForeignCurrency, setUseForeignCurrency] = useState(
        location.state?.useForeignCurrency !== undefined ? location.state.useForeignCurrency : true
    );
    const [excludeZeroBalance, setExcludeZeroBalance] = useState(location.state?.excludeZeroBalance || false);
    const [excludeNegativeBalance, setExcludeNegativeBalance] = useState(location.state?.excludeNegativeBalance || false);
    const [excludeLessThan, setExcludeLessThan] = useState(location.state?.excludeLessThan || false);
    const [lessThanAmount, setLessThanAmount] = useState(location.state?.lessThanAmount || 0);

    const [reportData, setReportData] = useState([]);
    const [clientList, setClientList] = useState([]);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [printModeAll, setPrintModeAll] = useState(false);

    const getClientList = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}client-list`);
            const list = response.data?.data || response.data || [];
            if (Array.isArray(list)) {
                const sortedList = [...list].sort((a, b) => {
                    const nameA = (a.client_name || a.full_name || a.name || "").toLowerCase();
                    const nameB = (b.client_name || b.full_name || b.name || "").toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                setClientList(sortedList);
            }
        } catch (error) {
            console.error("Error fetching client list:", error);
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
                route_url: "/Admin/customer-statement-report",
                user_type: usertype,
            };

            let permitted = false;
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                    postdata
                );
                if (response.data && response.data.success === true) {
                    permitted = true;
                }
            } catch (err) {
                try {
                    const fallback = await axios.post(
                        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                        {
                            staff_id: userid,
                            route_url: "/Admin/customer-balance-report",
                            user_type: usertype,
                        }
                    );
                    if (fallback.data && fallback.data.success === true) {
                        permitted = true;
                    }
                } catch (e) {
                    permitted = false;
                }
            }

            if (permitted) {
                setHasPermission(true);
                fetchReportData();
                getClientList();
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
        getClientList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch Statement Report Data
    const fetchReportData = async (
        e,
        optCustomerFrom = customerFrom,
        optCustomerTo = customerTo,
        optActive = active,
        optCategoryFrom = categoryFrom,
        optCategoryTo = categoryTo,
        optDateFrom = dateFrom,
        optDateTo = dateTo,
        optStatementDate = statementDate,
        optShowBroughtForward = showBalanceBroughtForward,
        optExcludeAllocated = excludeFullyAllocatedInvoices,
        optShowDetail = showDetail,
        optUseForeignCurr = useForeignCurrency,
        optExcludeZero = excludeZeroBalance,
        optExcludeNegative = excludeNegativeBalance,
        optExcludeLessThan = excludeLessThan,
        optLessThanAmount = lessThanAmount
    ) => {
        if (e) e.preventDefault();
        setLoader(true);
        setSearched(true);
        setCurrentPage(1);
        try {
            const payload = {
                customer_from: optCustomerFrom || "All",
                customer_to: optCustomerTo || "All",
                active: optActive || "Both",
                category_from: optCategoryFrom || "All",
                category_to: optCategoryTo || "All",
                date_from: formatToDDMMYYYY(optDateFrom) || formatToDDMMYYYY(getThirtyDaysAgoDateString()),
                date_to: formatToDDMMYYYY(optDateTo) || formatToDDMMYYYY(getTodayDateString()),
                statement_date: formatToDDMMYYYY(optStatementDate) || formatToDDMMYYYY(getTodayDateString()),
                show_balance_brought_forward: Boolean(optShowBroughtForward),
                exclude_fully_allocated_invoices: Boolean(optExcludeAllocated),
                show_detail: Boolean(optShowDetail),
                use_foreign_currency: Boolean(optUseForeignCurr),
                exclude_zero_balance: Boolean(optExcludeZero),
                exclude_negative_balance: Boolean(optExcludeNegative),
                exclude_less_than: Boolean(optExcludeLessThan),
                less_than_amount: Number(optLessThanAmount) || 0,
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getCustomerStatementReport`,
                payload
            );

            if (response.data && (response.data.success === true || response.data.customers)) {
                setReportData(response.data.customers || []);
            } else {
                setReportData([]);
                toast.error(response.data?.message || "No statement report data found");
            }
        } catch (error) {
            console.error("Error fetching customer statement report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch statement report data");
            setReportData([]);
        } finally {
            setLoader(false);
        }
    };

    const handleReset = () => {
        const thirtyDaysAgo = getThirtyDaysAgoDateString();
        const today = getTodayDateString();
        setCustomerFrom("All");
        setCustomerTo("All");
        setActive("Both");
        setCategoryFrom("All");
        setCategoryTo("All");
        setDateFrom(thirtyDaysAgo);
        setDateTo(today);
        setStatementDate(today);
        setShowBalanceBroughtForward(true);
        setExcludeFullyAllocatedInvoices(false);
        setShowDetail(false);
        setUseForeignCurrency(true);
        setExcludeZeroBalance(false);
        setExcludeNegativeBalance(false);
        setExcludeLessThan(false);
        setLessThanAmount(0);
        setSearchQuery("");
        setCurrentPage(1);

        fetchReportData(
            null,
            "All",
            "All",
            "Both",
            "All",
            "All",
            thirtyDaysAgo,
            today,
            today,
            true,
            false,
            false,
            true,
            false,
            false,
            false,
            0
        );
    };

    const handlePrintCurrent = () => {
        setPrintModeAll(false);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handlePrintAll = () => {
        setPrintModeAll(true);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const getCurrencySymbol = (currencyOrCustomer) => {
        if (!currencyOrCustomer) return "R";
        const val = currencyOrCustomer.toString().trim().toLowerCase();
        if (val === "usd" || val === "$") return "$";
        if (val === "rand" || val === "zar" || val === "r") return "R";
        if (val === "kwacha" || val === "mwk" || val === "zmw" || val === "k") return "K";
        if (val === "euro" || val === "eur" || val === "€") return "€";
        if (val === "inr" || val === "₹") return "₹";

        if (val.includes("usd")) return "$";
        if (val.includes("rand") || val.includes("zar")) return "R";
        if (val.includes("kwacha") || val.includes("mwk") || val.includes("zmw")) return "K";

        return currencyOrCustomer.length <= 3 ? currencyOrCustomer : "R";
    };

    const formatDisplayAmount = (val, displayVal, symbol = "R") => {
        if (displayVal !== undefined && displayVal !== null && displayVal !== "") {
            return displayVal;
        }
        const num = parseFloat(val);
        if (isNaN(num)) return `${symbol} 0.00`;
        return `${symbol} ${num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getDebitDisplay = (tx, symbol = "R") => {
        if (tx.debit_display !== undefined && tx.debit_display !== null && tx.debit_display !== "") {
            return tx.debit_display;
        }
        if (tx.debit?.display !== undefined && tx.debit?.display !== null && tx.debit?.display !== "") {
            return tx.debit.display;
        }
        const amt = parseFloat(tx.debit_amount ?? tx.debit?.amount ?? tx.debit ?? 0);
        if (!amt || amt === 0) return "";
        return `${symbol} ${amt.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getCreditDisplay = (tx, symbol = "R") => {
        if (tx.credit_display !== undefined && tx.credit_display !== null && tx.credit_display !== "") {
            return tx.credit_display;
        }
        if (tx.credit?.display !== undefined && tx.credit?.display !== null && tx.credit?.display !== "") {
            return tx.credit.display;
        }
        const amt = parseFloat(tx.credit_amount ?? tx.credit?.amount ?? tx.credit ?? 0);
        if (!amt || amt === 0) return "";
        return `${symbol} ${amt.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDateString = (dateVal) => {
        if (!dateVal) return "-";
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateVal)) return dateVal;
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateVal)) return dateVal.replace(/-/g, "/");
        const date = new Date(dateVal);
        if (Number.isNaN(date.getTime())) return String(dateVal);
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const getCustomerPostalAddress = (cust) => {
        if (Array.isArray(cust.postal_address_lines) && cust.postal_address_lines.length > 0) {
            return cust.postal_address_lines.filter(Boolean);
        }
        if (cust.postal_address && typeof cust.postal_address === "string") {
            return cust.postal_address.split("\n").map((l) => l.trim()).filter(Boolean);
        }
        if (Array.isArray(cust.physical_address_lines) && cust.physical_address_lines.length > 0) {
            return cust.physical_address_lines.filter(Boolean);
        }
        if (cust.physical_address && typeof cust.physical_address === "string") {
            return cust.physical_address.split("\n").map((l) => l.trim()).filter(Boolean);
        }
        return [];
    };

    const getCustomerPhysicalAddress = (cust) => {
        if (Array.isArray(cust.physical_address_lines) && cust.physical_address_lines.length > 0) {
            return cust.physical_address_lines.filter(Boolean);
        }
        if (cust.physical_address && typeof cust.physical_address === "string") {
            return cust.physical_address.split("\n").map((l) => l.trim()).filter(Boolean);
        }
        return [];
    };

    // Filter statement report data locally based on user search box
    const filteredCustomers = reportData.filter((cust) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const name = (cust.customer_name || "").toLowerCase();
        const id = String(cust.customer_id || "").toLowerCase();
        const cat = String(cust.category || "").toLowerCase();
        const vat = String(cust.customer_vat_no || cust.vat_no || cust.tax_ref || "").toLowerCase();
        return name.includes(q) || id.includes(q) || cat.includes(q) || vat.includes(q);
    });

    // Pagination calculations
    const numericPageSize = pageSize === "All" ? filteredCustomers.length : Number(pageSize);
    const totalPages = pageSize === "All" ? 1 : Math.max(1, Math.ceil(filteredCustomers.length / numericPageSize));
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (safeCurrentPage - 1) * numericPageSize;
    const displayedCustomers = printModeAll
        ? filteredCustomers
        : pageSize === "All"
            ? filteredCustomers
            : filteredCustomers.slice(startIndex, startIndex + numericPageSize);

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
                                <h4 className="freight_hd">Customer Statement Report</h4>
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
                        {/* Top Action Bar */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    className="btn btn-secondary d-flex align-items-center gap-2"
                                    onClick={() => navigate(-1)}
                                >
                                    <ArrowBackIcon /> Back
                                </button>
                                <h4 className="freight_hd mb-0 ms-2" style={{ fontSize: "1.25rem" }}>
                                    Customer Statement Report
                                </h4>
                                {reportData.length > 0 && (
                                    <span className="badge bg-primary rounded-pill px-2 py-1 ms-2" style={{ fontSize: "11px" }}>
                                        {reportData.length} Customers Loaded
                                    </span>
                                )}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                >
                                    <FilterListIcon fontSize="small" />
                                    {showAdvancedFilters ? "Hide Options" : "More Options"}
                                    {showAdvancedFilters ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary d-flex align-items-center gap-2 blueBtn btn-sm"
                                    onClick={handlePrintCurrent}
                                    title="Print visible statements"
                                >
                                    <PrintIcon fontSize="small" /> Print Statement
                                </button>
                            </div>
                        </div>

                        {/* Filter Form Card */}
                        <div className="card shadow-sm border-0 mb-4 bg-light">
                            <div className="card-body p-3 p-md-4">
                                <form onSubmit={fetchReportData}>
                                    <div className="row g-3 align-items-end">
                                        {/* Date From */}
                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Date From
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                            />
                                        </div>

                                        {/* Date To */}
                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Date To
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                            />
                                        </div>

                                        {/* Statement Date */}
                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Statement Date
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={statementDate}
                                                onChange={(e) => setStatementDate(e.target.value)}
                                            />
                                        </div>

                                        {/* Active Status */}
                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Active Status
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={active}
                                                onChange={(e) => setActive(e.target.value)}
                                            >
                                                <option value="Both">Both (Active & Inactive)</option>
                                                <option value="Active">Active Only</option>
                                                <option value="Inactive">Inactive Only</option>
                                            </select>
                                        </div>

                                        {/* Customer Range */}
                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Customer Range
                                            </label>
                                            <div className="d-flex gap-1">
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: "50%", minWidth: 0 }}
                                                    value={customerFrom}
                                                    onChange={(e) => setCustomerFrom(e.target.value)}
                                                >
                                                    <option value="All">(From - All)</option>
                                                    {clientList &&
                                                        clientList.length > 0 &&
                                                        clientList.map((item, index) => {
                                                            const name = (item.client_name || item.full_name || item.name || "").trim();
                                                            return (
                                                                <option key={item.id || `from_${index}`} value={name || String(item.id)}>
                                                                    {name || item.client_number || `Client #${item.id}`}
                                                                </option>
                                                            );
                                                        })}
                                                </select>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: "50%", minWidth: 0 }}
                                                    value={customerTo}
                                                    onChange={(e) => setCustomerTo(e.target.value)}
                                                >
                                                    <option value="All">(To - All)</option>
                                                    {clientList &&
                                                        clientList.length > 0 &&
                                                        clientList.map((item, index) => {
                                                            const name = (item.client_name || item.full_name || item.name || "").trim();
                                                            return (
                                                                <option key={item.id || `to_${index}`} value={name || String(item.id)}>
                                                                    {name || item.client_number || `Client #${item.id}`}
                                                                </option>
                                                            );
                                                        })}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Category Range */}
                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Category Range
                                            </label>
                                            <div className="d-flex gap-1">
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: "50%", minWidth: 0 }}
                                                    value={categoryFrom}
                                                    onChange={(e) => setCategoryFrom(e.target.value)}
                                                >
                                                    <option value="All">(From - All)</option>
                                                    <option value="South Africa">South Africa</option>
                                                    <option value="Zambia">Zambia</option>
                                                    <option value="Zimbabwe">Zimbabwe</option>
                                                </select>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: "50%", minWidth: 0 }}
                                                    value={categoryTo}
                                                    onChange={(e) => setCategoryTo(e.target.value)}
                                                >
                                                    <option value="All">(To - All)</option>
                                                    <option value="South Africa">South Africa</option>
                                                    <option value="Zambia">Zambia</option>
                                                    <option value="Zimbabwe">Zimbabwe</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="col-lg-6 col-md-4 col-sm-12 d-flex align-items-center gap-2">
                                            <button type="submit" className="btn btn-primary blueBtn btn-sm flex-fill">
                                                View Statement
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm flex-fill"
                                                onClick={handleReset}
                                            >
                                                Reset
                                            </button>
                                            {/* <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                                                onClick={handlePrintCurrent}
                                            >
                                                <PrintIcon fontSize="small" /> Print
                                            </button> */}
                                        </div>
                                    </div>

                                    {/* Advanced / Additional Options Row */}
                                    {showAdvancedFilters && (
                                        <div className="mt-3 pt-3 border-top">
                                            <div className="row g-2">
                                                <div className="col-md-3 col-sm-6">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="chkShowBalanceBroughtForward"
                                                            checked={showBalanceBroughtForward}
                                                            onChange={(e) => setShowBalanceBroughtForward(e.target.checked)}
                                                        />
                                                        <label
                                                            className="form-check-label text-dark"
                                                            htmlFor="chkShowBalanceBroughtForward"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            Show Balance Brought Forward
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-md-3 col-sm-6">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="chkExcludeFullyAllocated"
                                                            checked={excludeFullyAllocatedInvoices}
                                                            onChange={(e) => setExcludeFullyAllocatedInvoices(e.target.checked)}
                                                        />
                                                        <label
                                                            className="form-check-label text-dark"
                                                            htmlFor="chkExcludeFullyAllocated"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            Exclude Fully Allocated Invoices
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-md-3 col-sm-6">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="chkShowDetail"
                                                            checked={showDetail}
                                                            onChange={(e) => setShowDetail(e.target.checked)}
                                                        />
                                                        <label
                                                            className="form-check-label text-dark"
                                                            htmlFor="chkShowDetail"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            Show Detail (Transactions)
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-md-3 col-sm-6">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="chkUseForeignCurrency"
                                                            checked={useForeignCurrency}
                                                            onChange={(e) => setUseForeignCurrency(e.target.checked)}
                                                        />
                                                        <label
                                                            className="form-check-label text-dark"
                                                            htmlFor="chkUseForeignCurrency"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            Use Foreign Currency
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-md-3 col-sm-6">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="chkExcludeZeroBalance"
                                                            checked={excludeZeroBalance}
                                                            onChange={(e) => setExcludeZeroBalance(e.target.checked)}
                                                        />
                                                        <label
                                                            className="form-check-label text-dark"
                                                            htmlFor="chkExcludeZeroBalance"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            Exclude Zero Balance
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-md-3 col-sm-6">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="chkExcludeNegativeBalance"
                                                            checked={excludeNegativeBalance}
                                                            onChange={(e) => setExcludeNegativeBalance(e.target.checked)}
                                                        />
                                                        <label
                                                            className="form-check-label text-dark"
                                                            htmlFor="chkExcludeNegativeBalance"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            Exclude Negative Balance
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-md-3 col-sm-6 d-flex align-items-center gap-2">
                                                    <div className="form-check mb-0">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="chkExcludeLessThan"
                                                            checked={excludeLessThan}
                                                            onChange={(e) => setExcludeLessThan(e.target.checked)}
                                                        />
                                                        <label
                                                            className="form-check-label text-dark"
                                                            htmlFor="chkExcludeLessThan"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            Exclude Less Than
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="col-md-3 col-sm-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-white" style={{ fontSize: "11px" }}>Amount:</span>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            disabled={!excludeLessThan}
                                                            value={lessThanAmount}
                                                            onChange={(e) => setLessThanAmount(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Quick filter, search & pagination bar in web view */}
                        {searched && reportData.length > 0 && (
                            <div className="card shadow-sm border-0 mb-3 bg-white">
                                <div className="card-body p-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <span className="fw-semibold text-dark" style={{ fontSize: "13px" }}>
                                            Showing {filteredCustomers.length > 0 ? startIndex + 1 : 0} -{" "}
                                            {Math.min(startIndex + displayedCustomers.length, filteredCustomers.length)} of{" "}
                                            {filteredCustomers.length} Statements
                                        </span>
                                        {filteredCustomers.length !== reportData.length && (
                                            <span className="badge bg-secondary" style={{ fontSize: "11px" }}>
                                                Filtered from {reportData.length} total
                                            </span>
                                        )}
                                    </div>

                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        {/* Per page selector */}
                                        <div className="d-flex align-items-center gap-1">
                                            <span className="text-secondary" style={{ fontSize: "12px" }}>Per Page:</span>
                                            <select
                                                className="form-select form-select-sm"
                                                style={{ width: "75px" }}
                                                value={pageSize}
                                                onChange={(e) => {
                                                    setPageSize(e.target.value === "All" ? "All" : Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <option value="5">5</option>
                                                <option value="10">10</option>
                                                <option value="25">25</option>
                                                <option value="50">50</option>
                                                <option value="All">All</option>
                                            </select>
                                        </div>

                                        {/* Search box */}
                                        <div className="input-group input-group-sm" style={{ width: "230px" }}>
                                            <span className="input-group-text bg-white">
                                                <SearchIcon fontSize="small" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Search name, VAT, ID..."
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                            />
                                        </div>

                                        {/* Pagination buttons */}
                                        {pageSize !== "All" && totalPages > 1 && (
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    disabled={safeCurrentPage <= 1}
                                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                                >
                                                    <NavigateBeforeIcon fontSize="small" /> Prev
                                                </button>
                                                <span className="btn btn-light btn-sm text-dark disabled fw-semibold" style={{ minWidth: "90px" }}>
                                                    {safeCurrentPage} / {totalPages}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    disabled={safeCurrentPage >= totalPages}
                                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                                >
                                                    Next <NavigateNextIcon fontSize="small" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Print All / Print Page options */}
                                        {pageSize !== "All" && filteredCustomers.length > numericPageSize && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={handlePrintAll}
                                                title={`Print all ${filteredCustomers.length} statements`}
                                            >
                                                Print All ({filteredCustomers.length})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Customer Statements Display Container */}
                    {searched && (
                        <div className="statements-print-container">
                            {loader ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary spinner-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-secondary">Generating customer statement data...</p>
                                </div>
                            ) : displayedCustomers.length > 0 ? (
                                <>
                                    {displayedCustomers.map((cust, idx) => {
                                        const symbol = cust.currency_symbol || getCurrencySymbol(cust.currency || cust.final_base_currency || "ZAR");
                                        const customerName = (cust.customer_name || "").trim() || `Customer #${cust.customer_id || "-"}`;
                                        const customerVat = cust.customer_vat_no || cust.vat_no || cust.tax_ref || "";
                                        const postalLines = getCustomerPostalAddress(cust);
                                        const physicalLines = getCustomerPhysicalAddress(cust);
                                        const showPhysical = physicalLines.length > 0 && physicalLines.join(",") !== postalLines.join(",");

                                        return (
                                            <div className="customer-statement-sheet" key={cust.customer_id || idx}>
                                                {/* Top Header Grid */}
                                                <div className="statement-header-grid">
                                                    {/* Left: FROM ASIA DIRECT AFRICA */}
                                                    <div className="statement-party-box from-party">
                                                        <div className="statement-role-tag">FROM</div>
                                                        <div className="statement-party-title">{COMPANY_INFO.name}</div>
                                                        <div className="statement-vat-text">
                                                            <span className="fw-bold">VAT NO:</span> {COMPANY_INFO.vat_no}
                                                        </div>

                                                        <div className="statement-address-columns">
                                                            <div className="statement-address-block">
                                                                <div className="statement-address-label">POSTAL ADDRESS:</div>
                                                                <div className="statement-address-lines">
                                                                    {COMPANY_INFO.postal_address_lines.map((line, lIdx) => (
                                                                        <div key={lIdx}>{line}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="statement-address-block">
                                                                <div className="statement-address-label">PHYSICAL ADDRESS:</div>
                                                                <div className="statement-address-lines">
                                                                    {COMPANY_INFO.physical_address_lines.map((line, lIdx) => (
                                                                        <div key={lIdx}>{line}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: TO CUSTOMER */}
                                                    <div className="statement-party-box to-party">
                                                        <div className="statement-role-tag">TO</div>
                                                        <div className="statement-party-title">{customerName}</div>
                                                        <div className="statement-vat-text">
                                                            <span className="fw-bold">CUSTOMER VAT NO:</span> {customerVat || "-"}
                                                        </div>

                                                        <div className="statement-address-columns">
                                                            <div className="statement-address-block">
                                                                <div className="statement-address-label">POSTAL ADDRESS:</div>
                                                                <div className="statement-address-lines">
                                                                    {postalLines.length > 0 ? (
                                                                        postalLines.map((line, lIdx) => (
                                                                            <div key={lIdx}>{line}</div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="text-muted fst-italic">No postal address specified</div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {showPhysical && (
                                                                <div className="statement-address-block">
                                                                    <div className="statement-address-label">PHYSICAL ADDRESS:</div>
                                                                    <div className="statement-address-lines">
                                                                        {physicalLines.map((line, lIdx) => (
                                                                            <div key={lIdx}>{line}</div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Transaction Table */}
                                                <div className="statement-tx-table-container">
                                                    <table className="statement-tx-table">
                                                        <thead>
                                                            <tr>
                                                                <th className="th-date">Date</th>
                                                                <th className="th-ref">Reference</th>
                                                                <th className="th-desc">Description</th>
                                                                <th className="th-debit text-end">Debit</th>
                                                                <th className="th-credit text-end">Credit</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {cust.transactions && cust.transactions.length > 0 ? (
                                                                cust.transactions.map((tx, txIdx) => (
                                                                    <tr key={txIdx}>
                                                                        <td className="td-date">
                                                                            {tx.formatted_date || tx.date || formatDateString(tx.raw_date)}
                                                                        </td>
                                                                        <td className="td-ref">
                                                                            {tx.reference || tx.doc_no || tx.invoice_no || tx.ref_no || ""}
                                                                        </td>
                                                                        <td className="td-desc">
                                                                            {tx.description || tx.type || tx.details || ""}
                                                                        </td>
                                                                        <td className="td-debit text-end">
                                                                            {getDebitDisplay(tx, symbol)}
                                                                        </td>
                                                                        <td className="td-credit text-end">
                                                                            {getCreditDisplay(tx, symbol)}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="5" className="text-center text-muted py-4">
                                                                        No transactions found for this statement period
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Bottom Summary Ageing & Balance Box */}
                                                <div className="statement-summary-container">
                                                    <table className="statement-summary-table">
                                                        <tbody>
                                                            <tr className="summary-header-row">
                                                                <th className="col-ageing">120+ Days</th>
                                                                <th className="col-ageing">90 Days</th>
                                                                <th className="col-ageing">60 Days</th>
                                                                <th className="col-ageing">30 Days</th>
                                                                <th className="col-ageing">Current</th>
                                                                <th className="summary-label-cell">Amount Due</th>
                                                                <td className="summary-value-cell">
                                                                    {formatDisplayAmount(cust.totals?.amount_due, cust.totals?.amount_due_display, symbol)}
                                                                </td>
                                                            </tr>
                                                            <tr className="summary-data-row">
                                                                <td className="col-ageing">
                                                                    {formatDisplayAmount(cust.ageing?.days_120_plus, cust.ageing?.days_120_plus_display, symbol)}
                                                                </td>
                                                                <td className="col-ageing">
                                                                    {formatDisplayAmount(cust.ageing?.days_90, cust.ageing?.days_90_display, symbol)}
                                                                </td>
                                                                <td className="col-ageing">
                                                                    {formatDisplayAmount(cust.ageing?.days_60, cust.ageing?.days_60_display, symbol)}
                                                                </td>
                                                                <td className="col-ageing">
                                                                    {formatDisplayAmount(cust.ageing?.days_30, cust.ageing?.days_30_display, symbol)}
                                                                </td>
                                                                <td className="col-ageing">
                                                                    {formatDisplayAmount(cust.ageing?.current, cust.ageing?.current_display, symbol)}
                                                                </td>
                                                                <th className="summary-label-cell">Amount Paid</th>
                                                                <td className="summary-value-cell">
                                                                    {formatDisplayAmount(cust.totals?.amount_paid, cust.totals?.amount_paid_display, symbol)}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Bottom Pagination controls */}
                                    {pageSize !== "All" && totalPages > 1 && (
                                        <div className="d-flex justify-content-center align-items-center gap-2 my-4 no-print">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                disabled={safeCurrentPage <= 1}
                                                onClick={() => {
                                                    setCurrentPage((p) => Math.max(p - 1, 1));
                                                    window.scrollTo({ top: 300, behavior: "smooth" });
                                                }}
                                            >
                                                <NavigateBeforeIcon fontSize="small" /> Previous Page
                                            </button>
                                            <span className="fw-semibold text-secondary mx-2" style={{ fontSize: "13px" }}>
                                                Page {safeCurrentPage} of {totalPages} ({filteredCustomers.length} total statements)
                                            </span>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                disabled={safeCurrentPage >= totalPages}
                                                onClick={() => {
                                                    setCurrentPage((p) => Math.min(p + 1, totalPages));
                                                    window.scrollTo({ top: 300, behavior: "smooth" });
                                                }}
                                            >
                                                Next Page <NavigateNextIcon fontSize="small" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="card shadow-sm border-0 p-5 text-center">
                                    <p className="text-muted mb-0">No customer statements found for the selected filter criteria.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <style type="text/css">{`
                /* Statement Sheets Screen Styling */
                .statements-print-container {
                    width: 100%;
                }

                .customer-statement-sheet {
                    background: #ffffff;
                    max-width: 960px;
                    margin: 0 auto 35px auto;
                    padding: 45px 50px;
                    border-radius: 4px;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
                    border: 1px solid #e5e7eb;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    color: #111827;
                    box-sizing: border-box;
                }

                /* Header Layout */
                .statement-header-grid {
                    display: flex;
                    justify-content: space-between;
                    gap: 30px;
                    margin-bottom: 25px;
                }

                .statement-party-box {
                    flex: 1;
                }

                .statement-role-tag {
                    font-size: 11px;
                    font-weight: 700;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }

                .statement-party-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: #000000;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    margin-bottom: 8px;
                    line-height: 1.25;
                }

                .statement-vat-text {
                    font-size: 11.5px;
                    color: #1f2937;
                    margin-bottom: 12px;
                }

                .statement-address-columns {
                    display: flex;
                    gap: 24px;
                }

                .statement-address-block {
                    flex: 1;
                }

                .statement-address-label {
                    font-size: 10.5px;
                    font-weight: 700;
                    color: #4b5563;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                    letter-spacing: 0.2px;
                }

                .statement-address-lines {
                    font-size: 11px;
                    color: #374151;
                    line-height: 1.4;
                }

                /* Transaction Table */
                .statement-tx-table-container {
                    margin-top: 25px;
                    margin-bottom: 35px;
                    min-height: 220px;
                }

                .statement-tx-table {
                    width: 100%;
                    border-collapse: collapse;
                    border-top: 1px solid #d1d5db;
                    border-bottom: 1px solid #d1d5db;
                }

                .statement-tx-table thead th {
                    padding: 8px 10px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #4b5563;
                    font-style: italic;
                    border-bottom: 1px solid #d1d5db;
                    background: transparent;
                }

                .statement-tx-table tbody td {
                    padding: 7px 10px;
                    font-size: 11px;
                    color: #111827;
                    border-bottom: 1px solid #f3f4f6;
                }

                .statement-tx-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .th-date, .td-date {
                    width: 15%;
                    text-align: left;
                }

                .th-ref, .td-ref {
                    width: 20%;
                    text-align: left;
                }

                .th-desc, .td-desc {
                    width: 35%;
                    text-align: left;
                }

                .th-debit, .td-debit {
                    width: 15%;
                    text-align: right;
                }

                .th-credit, .td-credit {
                    width: 15%;
                    text-align: right;
                }

                /* Bottom Ageing & Totals Summary Box */
                .statement-summary-container {
                    margin-top: 20px;
                }

                .statement-summary-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #d1d5db;
                }

                .statement-summary-table th,
                .statement-summary-table td {
                    border: 1px solid #d1d5db;
                    padding: 6px 10px;
                    font-size: 10.5px;
                }

                .summary-header-row th {
                    font-weight: 700;
                    color: #1f2937;
                    text-align: center;
                }

                .summary-data-row td {
                    text-align: center;
                    color: #111827;
                }

                .col-ageing {
                    width: 14%;
                }

                .summary-label-cell {
                    width: 15%;
                    font-weight: 700;
                    color: #1f2937;
                    text-align: left !important;
                    background-color: #fafafa;
                }

                .summary-value-cell {
                    width: 15%;
                    font-weight: 700;
                    color: #000000;
                    text-align: right !important;
                }

                /* Print Styling */
                @page {
                    size: portrait;
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
                        background: #ffffff !important;
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

                    .statements-print-container {
                        display: block !important;
                        width: 100% !important;
                    }

                    .customer-statement-sheet {
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        padding: 0 !important;
                        margin: 0 0 0 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        min-height: calc(100vh - 20mm) !important;
                        page-break-after: always !important;
                        break-after: page !important;
                    }

                    .customer-statement-sheet:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }

                    .statement-tx-table {
                        border-top: 1px solid #000000 !important;
                        border-bottom: 1px solid #000000 !important;
                    }

                    .statement-tx-table thead th {
                        border-bottom: 1px solid #000000 !important;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .statement-tx-table tbody td {
                        border-bottom: 1px solid #e5e7eb !important;
                        color: #000000 !important;
                    }

                    .statement-summary-table {
                        border: 1px solid #000000 !important;
                    }

                    .statement-summary-table th,
                    .statement-summary-table td {
                        border: 1px solid #000000 !important;
                        color: #000000 !important;
                    }
                }
            `}</style>
        </>
    );
};

export default CustomerStatementReport;