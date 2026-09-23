import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const CustomerBalancesReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
    const userid = userdata?.id;
    const usertype = userdata?.user_type;
    const [hasPermission, setHasPermission] = useState(null);

    // Default to today's date (YYYY-MM-DD)
    const getTodayDateString = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    // Filter states
    const [runAtDate, setRunAtDate] = useState(location.state?.runAtDate || location.state?.runDate || getTodayDateString());
    const [customerFrom, setCustomerFrom] = useState(location.state?.customerFrom || "");
    const [customerTo, setCustomerTo] = useState(location.state?.customerTo || "");
    const [style, setStyle] = useState(location.state?.style || "summary"); // summary, detailed
    const [appliedStyle, setAppliedStyle] = useState(location.state?.style || "summary");

    const [reportData, setReportData] = useState([]);
    const [clientList, setClientList] = useState([]);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);

    const checkPermission = async () => {
        try {
            setLoader(true);
            if (!userid || !usertype) {
                setHasPermission(false);
                return;
            }
            const postdata = {
                staff_id: userid,
                route_url: "/Admin/customer-balance-report",
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

    const fetchClientList = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}clientlist`);
            if (response.data && response.data.success) {
                const list = response.data.data || [];
                const sortedList = [...list]
                    .filter((item) => item && item.client_name && item.client_name.trim() !== "")
                    .sort((a, b) => (a.client_name || "").localeCompare(b.client_name || ""));
                setClientList(sortedList);
            }
        } catch (error) {
            console.error("Error fetching client list:", error);
        }
    };

    useEffect(() => {
        checkPermission();
        fetchClientList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch report data
    const fetchReportData = async (
        e,
        optRunAtDate = runAtDate,
        optCustomerFrom = customerFrom,
        optCustomerTo = customerTo,
        optStyle = style
    ) => {
        if (e) e.preventDefault();
        setLoader(true);
        setSearched(true);
        try {
            const payload = {
                run_at_date: optRunAtDate || getTodayDateString(),
                customer_from: optCustomerFrom ? optCustomerFrom : null,
                customer_to: optCustomerTo ? optCustomerTo : null,
                style: optStyle || "summary",
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getCustomerBalancesDaysOutstandingReport`,
                payload
            );

            if (response.data && response.data.success) {
                setReportData(response.data.data || []);
                setAppliedStyle(response.data.filters?.style || optStyle || "summary");
            } else {
                setReportData([]);
                toast.error(response.data?.message || "No data found");
            }
        } catch (error) {
            console.error("Error fetching customer balances days outstanding report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
            setReportData([]);
        } finally {
            setLoader(false);
        }
    };

    const handleStyleChange = (e) => {
        const selectedStyle = e.target.value;
        setStyle(selectedStyle);
        fetchReportData(null, runAtDate, customerFrom, customerTo, selectedStyle);
    };

    const handleReset = () => {
        const today = getTodayDateString();
        setRunAtDate(today);
        setCustomerFrom("");
        setCustomerTo("");
        setStyle("summary");
        setAppliedStyle("summary");
        fetchReportData(null, today, "", "", "summary");
    };

    const handlePrint = () => {
        window.print();
    };

    const getCurrencySymbol = (currencyOrCustomer) => {
        if (!currencyOrCustomer) return "R";
        const val = currencyOrCustomer.toString().trim().toLowerCase();
        if (val === "usd" || val === "$") return "$";
        if (val === "rand" || val === "zar" || val === "r") return "R";
        if (val === "kwacha" || val === "mwk" || val === "k") return "K";
        if (val === "euro" || val === "eur" || val === "€") return "€";
        if (val === "inr" || val === "₹") return "₹";

        if (val.includes("usd")) return "$";
        if (val.includes("rand") || val.includes("zar")) return "R";
        if (val.includes("kwacha") || val.includes("mwk")) return "K";

        return currencyOrCustomer.length <= 3 ? currencyOrCustomer : "R";
    };

    const formatCurrencyValue = (val, currencyOrCustomer = "ZAR") => {
        const num = parseFloat(val);
        const symbol = getCurrencySymbol(currencyOrCustomer);
        if (isNaN(num)) return `${symbol} 0.00`;
        return `${symbol} ${num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
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

    const getCustomerFilterText = () => {
        if (!customerFrom && !customerTo) return "All Customers";
        const fromClient = clientList.find((c) => String(c.id) === String(customerFrom) || String(c.client_name) === String(customerFrom));
        const toClient = clientList.find((c) => String(c.id) === String(customerTo) || String(c.client_name) === String(customerTo));
        const fromName = fromClient ? (fromClient.client_name || fromClient.name) : customerFrom;
        const toName = toClient ? (toClient.client_name || toClient.name) : customerTo;

        if (customerFrom && customerTo && customerFrom === customerTo) {
            return fromName;
        }
        return `${fromName || "Start"} to ${toName || "End"}`;
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
                                <h4 className="freight_hd">Customer Balances Days Outstanding Report</h4>
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
                                    Customer Balances - Days Outstanding Report
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
                                    <div className="col-lg-3 col-md-3 col-sm-6">
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

                                    {/* Customer Range */}
                                    <div className="col-lg-4 col-md-4 col-sm-6">
                                        <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                            Customer
                                        </label>
                                        <div className="d-flex gap-1">
                                            <select
                                                className="form-select form-select-sm"
                                                value={customerFrom}
                                                onChange={(e) => setCustomerFrom(e.target.value)}
                                            >
                                                <option value="">(From)</option>
                                                {clientList.map((client, index) => (
                                                    <option key={client.id || index} value={client.id}>
                                                        {client.client_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                className="form-select form-select-sm"
                                                value={customerTo}
                                                onChange={(e) => setCustomerTo(e.target.value)}
                                            >
                                                <option value="">(To)</option>
                                                {clientList.map((client, index) => (
                                                    <option key={client.id || index} value={client.id}>
                                                        {client.client_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Style Filter */}
                                    <div className="col-lg-2 col-md-2 col-sm-6">
                                        <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                            Style
                                        </label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={style}
                                            onChange={handleStyleChange}
                                        >
                                            <option value="summary">Summary</option>
                                            <option value="detailed">Detailed</option>
                                        </select>
                                    </div>

                                    {/* Action Buttons */}
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
                                                Customer Balances - Days Outstanding Report
                                            </h4>
                                            <h6 className="report-subtitle mb-4 fw-bold text-secondary">
                                                Asia Direct Africa
                                            </h6>

                                            <div className="report-meta-info mt-3">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>
                                                                Customer:
                                                            </span>
                                                            <span className="text-secondary">{getCustomerFilterText()}</span>
                                                        </div>
                                                        <div className="d-flex mb-1">
                                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>
                                                                Style:
                                                            </span>
                                                            <span className="text-secondary text-capitalize">{appliedStyle}</span>
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

                                        {/* Report Table with Dark Navy Header */}
                                        {appliedStyle && appliedStyle.toString().toLowerCase() === "detailed" ? (
                                            /* Detailed View */
                                            <div className="table-responsive mt-4">
                                                <table className="table report-table">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-start" style={{ width: "110px" }}>Date</th>
                                                            <th className="text-start" style={{ width: "140px" }}>Document No.</th>
                                                            <th className="text-start">Reference</th>
                                                            <th className="text-end" style={{ width: "115px" }}>120+ Days</th>
                                                            <th className="text-end" style={{ width: "115px" }}>90 Days</th>
                                                            <th className="text-end" style={{ width: "115px" }}>60 Days</th>
                                                            <th className="text-end" style={{ width: "115px" }}>30 Days</th>
                                                            <th className="text-end" style={{ width: "115px" }}>Current</th>
                                                            <th className="text-end" style={{ width: "125px" }}>Total Due</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportData.map((item, index) => {
                                                            const custName = (item.customer_name || item.customer || item.name || item.client_name || "").trim() || "Cash Client";
                                                            const curr = item.final_base_currency || item.currency || item.base_currency || custName;
                                                            const days120Val = item.days_120 ?? item.days120 ?? 0;
                                                            const days90Val = item.days_90 ?? item.days90 ?? 0;
                                                            const days60Val = item.days_60 ?? item.days60 ?? 0;
                                                            const days30Val = item.days_30 ?? item.days30 ?? 0;
                                                            const currentVal = item.current ?? 0;
                                                            const totalDueVal = item.total_due ?? item.total ?? item.total_amount ?? 0;
                                                            const txList = item.transactions || item.items || [];

                                                            return (
                                                                <React.Fragment key={item.customer_id || index}>
                                                                    {/* Customer Header Row */}
                                                                    <tr className="customer-name-row" style={{ backgroundColor: "#e9ecef" }}>
                                                                        <td colSpan="9" className="text-start fw-bold" style={{ backgroundColor: "#e9ecef", fontSize: "13px" }}>
                                                                            {custName}
                                                                        </td>
                                                                    </tr>

                                                                    {/* Transaction Rows */}
                                                                    {txList.length > 0 ? (
                                                                        txList.map((tx, txIndex) => (
                                                                            <tr key={`${index}-${txIndex}`} className="invoice-item-row">
                                                                                <td className="text-start">{tx.date || formatDateString(tx.raw_date)}</td>
                                                                                <td className="text-start">{tx.document_no || "-"}</td>
                                                                                <td className="text-start">{tx.reference || "-"}</td>
                                                                                <td className="text-end">{formatCurrencyValue(tx.days_120 ?? tx.days120, curr)}</td>
                                                                                <td className="text-end">{formatCurrencyValue(tx.days_90 ?? tx.days90, curr)}</td>
                                                                                <td className="text-end">{formatCurrencyValue(tx.days_60 ?? tx.days60, curr)}</td>
                                                                                <td className="text-end">{formatCurrencyValue(tx.days_30 ?? tx.days30, curr)}</td>
                                                                                <td className="text-end">{formatCurrencyValue(tx.current, curr)}</td>
                                                                                <td className="text-end fw-semibold">{formatCurrencyValue(tx.total_due ?? tx.total ?? tx.total_amount, curr)}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="9" className="text-center text-muted py-2" style={{ fontStyle: "italic" }}>
                                                                                No transaction records found for this customer.
                                                                            </td>
                                                                        </tr>
                                                                    )}

                                                                    {/* Customer Subtotal Row */}
                                                                    <tr className="customer-total-row fw-bold" style={{ backgroundColor: "#f1f3f5" }}>
                                                                        <td colSpan="3" className="text-start fw-bold ps-3">Total for {custName}</td>
                                                                        <td className="text-end fw-bold">{formatCurrencyValue(days120Val, curr)}</td>
                                                                        <td className="text-end fw-bold">{formatCurrencyValue(days90Val, curr)}</td>
                                                                        <td className="text-end fw-bold">{formatCurrencyValue(days60Val, curr)}</td>
                                                                        <td className="text-end fw-bold">{formatCurrencyValue(days30Val, curr)}</td>
                                                                        <td className="text-end fw-bold">{formatCurrencyValue(currentVal, curr)}</td>
                                                                        <td className="text-end fw-bold">{formatCurrencyValue(totalDueVal, curr)}</td>
                                                                    </tr>

                                                                    {/* Spacer */}
                                                                    <tr className="spacer-row" style={{ height: "10px", border: "none" }}>
                                                                        <td colSpan="9" style={{ border: "none", background: "transparent", padding: "3px" }}></td>
                                                                    </tr>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </tbody>
                                                    {reportData.length > 0 && (
                                                        <tfoot className="fw-bold" style={{ borderTop: "2px solid #000" }}>
                                                            <tr style={{ background: "#e2e6ea" }}>
                                                                <td colSpan="3" className="text-start fw-bold ps-3">Grand Total</td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.days_120 ?? i.days120) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.days_90 ?? i.days90) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.days_60 ?? i.days60) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.days_30 ?? i.days30) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.current) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.total_due ?? i.total ?? i.total_amount) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    )}
                                                </table>
                                            </div>
                                        ) : (
                                            /* Summary View */
                                            <div className="table-responsive mt-4">
                                                <table className="table report-table">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-start">Customer</th>
                                                            <th className="text-end" style={{ width: "120px" }}>120+ Days</th>
                                                            <th className="text-end" style={{ width: "120px" }}>90 Days</th>
                                                            <th className="text-end" style={{ width: "120px" }}>60 Days</th>
                                                            <th className="text-end" style={{ width: "120px" }}>30 Days</th>
                                                            <th className="text-end" style={{ width: "120px" }}>Current</th>
                                                            <th className="text-end" style={{ width: "130px" }}>Total Due</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportData.map((item, index) => {
                                                            const custName = (item.customer_name || item.customer || item.name || item.client_name || "").trim() || "Cash Client";
                                                            const curr = item.final_base_currency || item.currency || item.base_currency || custName;
                                                            const days120Val = item.days_120 ?? item.days120 ?? 0;
                                                            const days90Val = item.days_90 ?? item.days90 ?? 0;
                                                            const days60Val = item.days_60 ?? item.days60 ?? 0;
                                                            const days30Val = item.days_30 ?? item.days30 ?? 0;
                                                            const currentVal = item.current ?? 0;
                                                            const totalDueVal = item.total_due ?? item.total ?? item.total_amount ?? 0;

                                                            return (
                                                                <tr key={index}>
                                                                    <td className="text-start">{custName}</td>
                                                                    <td className="text-end">{formatCurrencyValue(days120Val, curr)}</td>
                                                                    <td className="text-end">{formatCurrencyValue(days90Val, curr)}</td>
                                                                    <td className="text-end">{formatCurrencyValue(days60Val, curr)}</td>
                                                                    <td className="text-end">{formatCurrencyValue(days30Val, curr)}</td>
                                                                    <td className="text-end">{formatCurrencyValue(currentVal, curr)}</td>
                                                                    <td className="text-end fw-semibold">{formatCurrencyValue(totalDueVal, curr)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    {reportData.length > 0 && (
                                                        <tfoot className="fw-bold" style={{ borderTop: "2px solid #000" }}>
                                                            <tr style={{ background: "#f1f3f5" }}>
                                                                <td className="text-start fw-bold">Total</td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.days_120 ?? i.days120) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.days_90 ?? i.days90) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.days_60 ?? i.days60) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.days_30 ?? i.days30) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.current) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    {formatCurrencyValue(
                                                                        reportData.reduce((acc, i) => acc + (parseFloat(i.total_due ?? i.total ?? i.total_amount) || 0), 0),
                                                                        reportData[0]?.final_base_currency
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    )}
                                                </table>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted mb-0">No outstanding customer balances found for the selected filters.</p>
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
                .report-table tbody td, .report-table tfoot td {
                    border: 1px solid #000000 !important;
                    padding: 8px 12px !important;
                    font-size: 12px;
                    color: #000000;
                }
                .report-table tbody tr:hover td {
                    background-color: #f8f9fa;
                }
                .report-table tbody tr.customer-name-row td {
                    background-color: #e9ecef !important;
                    font-weight: bold;
                    font-size: 12.5px;
                    padding: 8px 12px !important;
                    border-top: 1.5px solid #1b2245 !important;
                }
                .report-table tbody tr.customer-total-row td {
                    background-color: #f1f3f5 !important;
                    font-weight: bold;
                    padding: 7px 12px !important;
                    border-top: 1px solid #1b2245 !important;
                    border-bottom: 1.5px solid #1b2245 !important;
                }
                .report-table tbody tr.invoice-item-row td {
                    padding: 6px 12px !important;
                    font-size: 11.5px;
                }
                .report-table tbody tr.spacer-row td {
                    border: none !important;
                    background-color: transparent !important;
                    padding: 0 !important;
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
                    .report-table tbody td, .report-table tfoot td {
                        border: 1px solid #000000 !important;
                        padding: 5px 8px !important;
                        font-size: 11px !important;
                    }
                    .report-table tbody tr.customer-name-row td {
                        background-color: #e9ecef !important;
                        font-weight: bold;
                        font-size: 11px !important;
                        padding: 5px 8px !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .report-table tbody tr.customer-total-row td {
                        background-color: #f1f3f5 !important;
                        font-weight: bold;
                        font-size: 10.5px !important;
                        padding: 4px 8px !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .report-table tbody tr.invoice-item-row td {
                        padding: 4px 8px !important;
                        font-size: 10px !important;
                    }
                    .report-table tbody tr.spacer-row td {
                        border: none !important;
                        background-color: transparent !important;
                        padding: 0 !important;
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

export default CustomerBalancesReport;
