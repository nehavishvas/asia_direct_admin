import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

export default function BatchReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const batchId = location.state?.batchId;

  const [batchData, setBatchData] = useState(null);
  const [loader, setLoader] = useState(false);

  // Fetch report data
  const fetchReportData = async () => {
    if (!batchId) {
      toast.error("Batch ID not found");
      return;
    }
    setLoader(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}getBatchReport/${batchId}`
      );

      if (response.data && response.data.success) {
        setBatchData(response.data.data);
      } else {
        toast.error(response.data?.message || "Failed to fetch batch report");
      }
    } catch (error) {
      console.error("Error fetching batch report:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch batch report"
      );
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [batchId]);

  const handlePrint = () => {
    window.print();
  };

  const formatDateString = (dateVal) => {
    if (!dateVal || dateVal === "0000-00-00" || dateVal === "0000-00-00 00:00:00") return "";
    const date = new Date(dateVal);
    if (Number.isNaN(date.getTime())) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const yy = String(yyyy).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  const formatNumber = (num, decimals = 2) => {
    const val = parseFloat(num);
    if (isNaN(val)) return decimals === 2 ? "0.00" : "0";
    return val.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  if (!batchId) {
    return (
      <div className="wpWrapper text-center py-5">
        <h4>No Batch ID specified.</h4>
        <button className="btn btn-primary mt-3 blueBtn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const batch = batchData?.batch || {};
  const routing = batchData?.routing_information || {};
  const consignments = batchData?.consignments || [];
  const totals = batchData?.totals || { volume: 0, packages: 0, weight: 0 };

  // Calculate empty rows needed to fill space (to match the template style)
  const minRows = 15;
  const emptyRowsCount = Math.max(0, minRows - consignments.length);
  const emptyRows = Array.from({ length: emptyRowsCount });

  return (
    <>
      
      <div className="wpWrapper">
        <div className="container-fluid no-print">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <ArrowBackIcon
                onClick={() => navigate(-1)}
                style={{ cursor: "pointer", fontSize: "28px" }}
              />
              <h4 className="freight_hd mb-0">Batch Report</h4>
            </div>
            <div>
              <button
                className="btn btn-primary d-flex align-items-center gap-2 blueBtn"
                onClick={handlePrint}
              >
                <PrintIcon /> Print Report
              </button>
            </div>
          </div>
        </div>

        {loader ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-secondary">Loading report data...</p>
          </div>
        ) : (
          <div className="card shadow-sm border-0 report-print-area">
            <div className="card-body p-4 p-md-5">
              <div className="report-container">
                {/* Company Header */}
                <div className="report-header-text">
                  <h3 className="report-company-name">Asia Direct - Africa (Pty) Ltd</h3>
                  <p className="report-company-address">
                    Address: Unit 4, Villa Valencia Office Park, 2 Anemoon Ave, Kempton Park, South Africa, 1619
                  </p>
                  <p className="report-company-reg">
                    Reg: 2017/057805/07 &nbsp;&nbsp;&bull;&nbsp;&nbsp; Vat: 4740280377
                  </p>
                </div>

                {/* Subtitle / Title */}
                <div className="report-title-section">
                  AIR / SEA LCL Consolidation
                </div>

                {/* Meta details */}
                <div className="report-meta-box">
                  <div className="report-meta-item">
                    <div className="report-meta-label">Batch Reference</div>
                    <div className="report-meta-value">
                      {batch.batch_reference || "-"}
                    </div>
                  </div>
                  <div className="report-meta-item">
                    <div className="report-meta-label">Shipping Agent</div>
                    <div className="report-meta-value">
                      {routing.shipping_agent || batch.agent || batch.forwarding_agent || "-"}
                    </div>
                  </div>
                </div>

                {/* Routing Information Section */}
                <div className="section-container">
                  <div className="section-header-tab">Routing Information</div>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Mode</th>
                        <th>B/L Release type</th>
                        <th>Carrier</th>
                        <th>Load</th>
                        <th>Discharge</th>
                        <th>ETD</th>
                        <th>ETA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{routing.freight || batch.freight || "-"}</td>
                        <td>{routing.release_type || "-"}</td>
                        <td>{routing.carrier || batch.carrier || "-"}</td>
                        <td>{routing.port_of_loading || batch.port_loading || "-"}</td>
                        <td>{routing.port_of_discharge || batch.port_discharge || "-"}</td>
                        <td>{formatDateString(routing.ETD) || formatDateString(batch.ETD) || "-"}</td>
                        <td>{formatDateString(routing.ATD) || formatDateString(batch.date_dispatch) || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Consignment Information Section */}
                <div className="section-container">
                  <div className="section-header-tab">Consignment Information</div>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th style={{ width: "12%" }}>Marks</th>
                        <th style={{ width: "40%" }}>Goods Description</th>
                        <th style={{ width: "12%" }}>Volume</th>
                        <th style={{ width: "12%" }}>Packages</th>
                        <th style={{ width: "14%" }}>Warehouse Receipt Ref</th>
                        <th style={{ width: "10%" }}>Date Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consignments.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.marks || "-"}</td>
                          <td>{item.goods_description || "-"}</td>
                          <td>{formatNumber(item.volume, 2)}</td>
                          <td>{formatNumber(item.packages, 0)}</td>
                          <td>{item.warehouse_receipt_reference || "-"}</td>
                          <td>{formatDateString(item.date_received) || "-"}</td>
                        </tr>
                      ))}
                      {emptyRows.map((_, idx) => (
                        <tr key={`empty-${idx}`}>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                        </tr>
                      ))}
                      <tr className="totals-row">
                        <td colSpan={2} style={{ textAlign: "right", fontWeight: "bold" }}>Total:</td>
                        <td style={{ fontWeight: "bold" }}>{formatNumber(totals.volume, 2)}</td>
                        <td style={{ fontWeight: "bold" }}>{formatNumber(totals.packages, 0)}</td>
                        <td colSpan={2}>&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .report-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
          color: #000;
        }
        .report-header-text {
          text-align: center;
          margin-bottom: 25px;
        }
        .report-company-name {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 5px 0;
          color: #000;
        }
        .report-company-address {
          font-size: 11px;
          margin: 0 0 3px 0;
          color: #333;
        }
        .report-company-reg {
          font-size: 10px;
          margin: 0;
          color: #555;
        }
        .report-title-section {
          font-size: 16px;
          font-weight: bold;
          margin-top: 25px;
          margin-bottom: 12px;
          text-align: left;
          text-transform: uppercase;
        }
        .report-meta-box {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          gap: 40px;
        }
        .report-meta-item {
          flex: 1;
        }
        .report-meta-label {
          font-size: 11px;
          font-weight: bold;
          border: 1px solid #000;
          border-bottom: none;
          display: inline-block;
          padding: 3px 12px;
          background-color: #fff;
        }
        .report-meta-value {
          border: 1px solid #000;
          padding: 8px 12px;
          font-size: 12px;
          background-color: #f2f2f2;
          border-radius: 0 4px 4px 4px;
          min-height: 18px;
        }
        .section-container {
          margin-bottom: 20px;
        }
        .section-header-tab {
          border: 1px solid #000;
          border-bottom: none;
          font-size: 11px;
          font-weight: bold;
          padding: 3px 12px;
          text-transform: uppercase;
          display: inline-block;
          background-color: #fff;
        }
        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0px;
        }
        .report-table th {
          border: 1px solid #000;
          padding: 5px 8px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          text-align: left;
          background-color: #fff;
        }
        .report-table td {
          border: 1px solid #000;
          padding: 5px 8px;
          font-size: 11px;
          height: 28px;
          vertical-align: middle;
        }
        .totals-row td {
          font-weight: bold;
          background-color: #fff;
        }
        
        @page {
          size: portrait;
          margin: 15mm 10mm 15mm 10mm;
        }
        @media print {
          html, body, #root, #root > div, .App, .admin-layout, .layout-main, .wpWrapper {
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
        }
      `}} />
    </>
  );
}
