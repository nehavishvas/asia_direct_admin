import React, { useState } from "react";
import { Modal, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

const ReportFilterModal = ({ open, onClose, reportType }) => {
    const navigate = useNavigate();

    // Default Date Helpers
    const getStartOfCurrentMonth = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}-01`;
    };

    const getEndOfCurrentMonth = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
        return `${y}-${m}-${lastDay}`;
    };

    const getTodayDateString = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    // Filter States
    const [startDate, setStartDate] = useState(getStartOfCurrentMonth());
    const [endDate, setEndDate] = useState(getEndOfCurrentMonth());
    const [runDate, setRunDate] = useState(getTodayDateString());
    const [customerFrom, setCustomerFrom] = useState("");
    const [customerTo, setCustomerTo] = useState("");
    const [categoryFrom, setCategoryFrom] = useState("");
    const [categoryTo, setCategoryTo] = useState("");
    const [invoiceStatus, setInvoiceStatus] = useState("ALL");

    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    const handleReset = () => {
        setStartDate(getStartOfCurrentMonth());
        setEndDate(getEndOfCurrentMonth());
        setRunDate(getTodayDateString());
        setCustomerFrom("");
        setCustomerTo("");
        setCategoryFrom("");
        setCategoryTo("");
        setInvoiceStatus("ALL");
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        onClose();

        if (reportType === "quotes") {
            navigate("/Admin/customer-quotes-report", {
                state: {
                    startDate,
                    endDate,
                    customerFrom,
                    customerTo,
                    categoryFrom,
                    categoryTo,
                    invoiceStatus
                }
            });
        } else if (reportType === "invoices") {
            navigate("/Admin/customer-invoices-report", {
                state: {
                    startDate,
                    endDate,
                    customerFrom,
                    customerTo,
                    categoryFrom,
                    categoryTo,
                    invoiceStatus
                }
            });
        } else if (reportType === "unallocated") {
            navigate("/Admin/customer-unallocated-report", {
                state: {
                    startDate,
                    endDate,
                    customerFrom,
                    customerTo,
                    categoryFrom,
                    categoryTo
                }
            });
        } else if (reportType === "balances") {
            navigate("/Admin/customer-balance-report", {
                state: {
                    runDate,
                    customerFrom,
                    customerTo,
                    categoryFrom,
                    categoryTo
                }
            });
        } else if (reportType === "quotes_by_item") {
            navigate("/Admin/quote-report-item", {
                state: {
                    startDate,
                    endDate,
                    customerFrom,
                    customerTo,
                    categoryFrom,
                    categoryTo
                }
            });
        }
    };

    // Resolve Report Modal Title
    const getReportTitle = () => {
        switch (reportType) {
            case "quotes":
                return "Customer Quotes Report Filters";
            case "invoices":
                return "Customer Invoices Report Filters";
            case "unallocated":
                return "Customer Unallocated Receipts Report Filters";
            case "balances":
                return "Customer Balances - Days Outstanding Report Filters";
            case "quotes_by_item":
                return "Quote Report Item Filters";
            default:
                return "Report Filters";
        }
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="report-filter-modal-title">
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90%",
                    maxWidth: "650px",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    borderRadius: "8px",
                    overflow: "hidden"
                }}
            >
                {/* Modal Header */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                    <h5 id="report-filter-modal-title" className="mb-0 text-dark fw-bold">
                        {getReportTitle()}
                    </h5>
                    <button className="btn btn-close p-1" onClick={onClose} style={{ background: "none", border: "none" }}>
                        <CloseIcon />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                    <form onSubmit={handleSubmit}>
                        <div className="row justify-content-center">
                            <div className="col-12">
                                {/* Date / Date Range */}
                                {reportType === "balances" ? (
                                    <div className="row mb-3 align-items-center">
                                        <div className="col-sm-3 text-md-end text-start">
                                            <label className="form-label text-secondary fw-semibold mb-0">Run At Date</label>
                                        </div>
                                        <div className="col-sm-9">
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={runDate}
                                                onChange={(e) => setRunDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="row mb-3 align-items-center">
                                        <div className="col-sm-3 text-md-end text-start">
                                            <label className="form-label text-secondary fw-semibold mb-0">Date Range</label>
                                        </div>
                                        <div className="col-sm-4 col-6">
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-sm-4 col-6">
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Customer From & To */}
                                <div className="row mb-3 align-items-center">
                                    <div className="col-sm-3 text-md-end text-start">
                                        <label className="form-label text-secondary fw-semibold mb-0">Customer</label>
                                    </div>
                                    <div className="col-sm-4 col-6">
                                        <select
                                            className="form-select"
                                            value={customerFrom}
                                            onChange={(e) => setCustomerFrom(e.target.value)}
                                        >
                                            <option value="">(From)</option>
                                            {alphabet.map((letter) => (
                                                <option key={letter} value={letter}>
                                                    {letter}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-4 col-6">
                                        <select
                                            className="form-select"
                                            value={customerTo}
                                            onChange={(e) => setCustomerTo(e.target.value)}
                                        >
                                            <option value="">(To)</option>
                                            {alphabet.map((letter) => (
                                                <option key={letter} value={letter}>
                                                    {letter}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Category From & To */}
                                <div className="row mb-3 align-items-center">
                                    <div className="col-sm-3 text-md-end text-start">
                                        <label className="form-label text-secondary fw-semibold mb-0">Category</label>
                                    </div>
                                    <div className="col-sm-4 col-6">
                                        <select
                                            className="form-select"
                                            value={categoryFrom}
                                            onChange={(e) => setCategoryFrom(e.target.value)}
                                        >
                                            <option value="">(From)</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="Zambia">Zambia</option>
                                            <option value="Zimbabwe">Zimbabwe</option>
                                        </select>
                                    </div>
                                    <div className="col-sm-4 col-6">
                                        <select
                                            className="form-select"
                                            value={categoryTo}
                                            onChange={(e) => setCategoryTo(e.target.value)}
                                        >
                                            <option value="">(To)</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="Zambia">Zambia</option>
                                            <option value="Zimbabwe">Zimbabwe</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Invoice Status */}
                                {(reportType === "quotes" || reportType === "invoices") && (
                                    <div className="row mb-3 align-items-center">
                                        <div className="col-sm-3 text-md-end text-start">
                                            <label className="form-label text-secondary fw-semibold mb-0">Invoice Status</label>
                                        </div>
                                        <div className="col-sm-9">
                                            <select
                                                className="form-select"
                                                value={invoiceStatus}
                                                onChange={(e) => setInvoiceStatus(e.target.value)}
                                            >
                                                {reportType === "quotes" ? (
                                                    <>
                                                        <option value="ALL">ALL</option>
                                                        <option value="Pending">Pending</option>
                                                        <option value="Invoiced">Invoiced</option>
                                                        <option value="Expired">Expired</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="ALL">ALL</option>
                                                        <option value="unpaid">Unpaid</option>
                                                        <option value="paid">Paid</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="d-flex justify-content-center gap-2 mt-4">
                                    <button type="button" className="btn btn-outline-secondary px-4" onClick={handleReset}>
                                        Reset
                                    </button>
                                    <button type="submit" className="btn btn-primary blueBtn px-4">
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </Box>
        </Modal>
    );
};

export default ReportFilterModal;
