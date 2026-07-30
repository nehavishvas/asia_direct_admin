import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const QuoteItemReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.state?.id;

    const [quoteInfo, setQuoteInfo] = useState(null);
    const [charges, setCharges] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loader, setLoader] = useState(false);

    // Fetch report data
    const fetchReportData = async () => {
        if (!id) {
            toast.error("Quote ID not found");
            return;
        }
        setLoader(true);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}GetCustomerQuoteReportById`,
                { freight_quote_estimate_id: id }
            );

            if (response.data && response.data.success) {
                setQuoteInfo(response.data.data?.quote_information || null);
                setCharges(response.data.data?.charges || null);
                setSummary(response.data.data?.summary || null);
            } else {
                toast.error(response.data?.message || "Failed to fetch report data");
            }
        } catch (error) {
            console.error("Error fetching quote item report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    // Helper to resolve currency symbol
    const getCurrencySymbol = (currencyCode) => {
        if (!currencyCode) return "R";
        const code = String(currencyCode).toUpperCase();
        if (code === "USD") return "$";
        if (code === "EUR" || code === "EURO") return "€";
        if (code === "GBP") return "£";
        return "R";
    };

    // Currency Formatting (Negative support, e.g. R-3,812.50)
    const formatCurrency = (amount, currencySymbol = "R") => {
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

    // Combine all charges categories
    const getCombinedCharges = () => {
        if (!charges) return [];
        const categories = [
            "Origin Charges",
            "Freight Charges",
            "Destination Charges",
            "Customs Charges",
            "Transit Charges",
            "Admin Charges"
        ];
        const list = [];
        categories.forEach((cat) => {
            const arr = charges[cat] || [];
            arr.forEach((item) => {
                list.push(item);
            });
        });
        return list;
    };

    const combinedList = getCombinedCharges();
    const currencySymbol = getCurrencySymbol(quoteInfo?.currency);

    // Dynamic Summary Totals
    const calculateTotals = () => {
        let qtyTotal = 0;
        let costTotal = 0;
        let sellingTotal = 0;

        combinedList.forEach((item) => {
            qtyTotal += parseFloat(item.qty) || 0;
            costTotal += parseFloat(item.total_cost) || 0;
            sellingTotal += parseFloat(item.final_amount) || 0;
        });

        const gpAmountTotal = sellingTotal - costTotal;
        const gpPercentTotal = sellingTotal > 0 ? (gpAmountTotal / sellingTotal) * 100 : 0;

        return {
            qtyTotal,
            costTotal,
            sellingTotal,
            gpAmountTotal,
            gpPercentTotal
        };
    };

    const totals = calculateTotals();

    return (
        <>
            <div className="wpWrapper report-wrapper">
                <div className="container-fluid no-print">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button className="btn btn-secondary d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
                            <ArrowBackIcon /> Back
                        </button>
                        {quoteInfo && combinedList.length > 0 && (
                            <button className="btn btn-primary d-flex align-items-center gap-2 blueBtn" onClick={handlePrint}>
                                <PrintIcon /> Print Report
                            </button>
                        )}
                    </div>
                </div>

                {/* Printable Area */}
                <div className="card shadow-sm border-0 report-print-area">
                    <div className="card-body p-4 p-md-5">
                        {loader ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary spinner-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-secondary">Generating report data...</p>
                            </div>
                        ) : quoteInfo ? (
                            <>
                                {/* Report Header */}
                                <div className="report-header mb-4 text-start">
                                    <h4 className="report-title mb-1 fw-bold text-dark">Customer Quote Item Report</h4>
                                    <h6 className="report-subtitle mb-4 fw-bold text-secondary">Asia Direct Africa</h6>

                                    <div className="report-meta-info mt-3">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Reference:</span>
                                                    <span className="text-secondary">{quoteInfo.reference_no || "-"}</span>
                                                </div>
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Customer:</span>
                                                    <span className="text-secondary">{quoteInfo.customer_name || "-"}</span>
                                                </div>
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Freight Number:</span>
                                                    <span className="text-secondary">{quoteInfo.freight_number || "-"}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Date:</span>
                                                    <span className="text-secondary">{formatDateString(quoteInfo.quote_date)}</span>
                                                </div>
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Country:</span>
                                                    <span className="text-secondary">{quoteInfo.invoice_for_country || "-"}</span>
                                                </div>
                                                <div className="d-flex mb-1">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Currency:</span>
                                                    <span className="text-secondary">{quoteInfo.currency || "-"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Report Table */}
                                <div className="table-responsive mt-4">
                                    <table className="table table-bordered report-table">
                                        <thead className="table-light-grey">
                                            <tr>
                                                <th className="text-start">Item</th>
                                                <th className="text-end">Qty</th>
                                                <th className="text-end">Total Cost</th>
                                                <th className="text-end">Total Selling</th>
                                                <th className="text-end">GP Amount</th>
                                                <th className="text-end">GP %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {combinedList.length > 0 ? (
                                                combinedList.map((item, index) => {
                                                    const cost = parseFloat(item.total_cost) || 0;
                                                    const selling = parseFloat(item.final_amount) || 0;
                                                    const gpAmount = selling - cost;
                                                    const gpPercent = parseFloat(item.gp_percent) || 0;

                                                    return (
                                                        <tr key={index}>
                                                            <td className="text-start">{`${item.code || ""} - ${item.description || ""}`}</td>
                                                            <td className="text-end">{parseFloat(item.qty || 0).toFixed(4)}</td>
                                                            <td className="text-end">{formatCurrency(cost, currencySymbol)}</td>
                                                            <td className="text-end">{formatCurrency(selling, currencySymbol)}</td>
                                                            <td className="text-end">{formatCurrency(gpAmount, currencySymbol)}</td>
                                                            <td className="text-end">{gpPercent.toFixed(2)}%</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center text-muted py-4">
                                                        No charges found for this quote.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {combinedList.length > 0 && (
                                            <tfoot className="table-light fw-bold" style={{ borderTop: "2px solid #ccc" }}>
                                                <tr>
                                                    <td className="text-start">Grand Total:</td>
                                                    <td className="text-end">{totals.qtyTotal.toFixed(3)}</td>
                                                    <td className="text-end">{formatCurrency(totals.costTotal, currencySymbol)}</td>
                                                    <td className="text-end">{formatCurrency(totals.sellingTotal, currencySymbol)}</td>
                                                    <td className="text-end">{formatCurrency(totals.gpAmountTotal, currencySymbol)}</td>
                                                    <td className="text-end text-primary">{totals.gpPercentTotal.toFixed(2)}%</td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted mb-0">No quote details found for the selected ID.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer />
            <style type="text/css" media="print">{`
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
                        border: 1px solid #dee2e6 !important;
                        padding: 6px 8px !important;
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

export default QuoteItemReport;
