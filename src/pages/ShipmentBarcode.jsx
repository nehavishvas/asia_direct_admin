import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Barcode from "react-barcode";
import {
  FiEye,
  FiPrinter,
  FiCopy,
  FiRefreshCw,
  FiSearch,
  FiBox,
  FiTruck,
  FiArrowRight,
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiAlertTriangle,
  FiPackage,
  FiNavigation,
  FiDownload,
  FiFileText,
  FiCode,
  FiLayers,
  FiFilter,
  FiActivity,
  FiClock,
  FiImage,
  FiAlertCircle,
  FiCheckSquare,
  FiCompass,
  FiDatabase,
  FiUser,
  FiMapPin,
} from "react-icons/fi";
import { RiQrScan2Line, RiFileList3Line } from "react-icons/ri";
import { FaShip, FaPlane, FaBoxes, FaWarehouse, FaClipboardCheck } from "react-icons/fa";
import CustomPagination from "../components/common/CustomPagination";

const STATIC_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpdC1zdXBwb3J0QGFzaWFkaXJlY3QuYWZyaWNhIiwicm9sZSI6InN0YWZmIiwidXNlcl90eXBlIjoxLCJuYW1lIjoiQWRtaW4iLCJpYXQiOjE3OTA3Njg3NzB9.OXIb4E_H0MwHUgUAfyIUAvXreIsU-CDJPCPsSezlR8I";

const getAuthHeaders = () => {
  let token = STATIC_TOKEN;
  try {
    const localData = JSON.parse(localStorage.getItem("data123") || "{}");
    if (localData?.token) {
      token = localData.token;
    } else if (localData?.access_token) {
      token = localData.access_token;
    }
  } catch (e) { }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const getApiBaseUrl = () => {
  let base = process.env.REACT_APP_BASE_URL || "http://192.168.1.72:8080/api/";
  if (!base.endsWith("/")) base += "/";
  return base;
};

const getAssetBaseUrl = () => {
  const base = getApiBaseUrl();
  return base.replace(/\/api\/?$/, "");
};

export default function ShipmentBarcode() {
  // Navigation Tabs: 'shipments' | 'orders' | 'tracking' | 'reconciliation'
  const [activeTab, setActiveTab] = useState("shipments");

  // 1. TMS Shipments List State (GET /api/warehouse/shipments)
  const [shipments, setShipments] = useState([]);
  const [totalShipments, setTotalShipments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Quick Scanner / Direct Lookup Input
  const [scannerInput, setScannerInput] = useState("");

  // 2. Direct Consignments & Orders State (POST /api/warehouse/orders)
  const [ordersList, setOrdersList] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersLimit, setOrdersLimit] = useState(15);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersBarcodeStatus, setOrdersBarcodeStatus] = useState("ALL");
  const [ordersWarehouseId, setOrdersWarehouseId] = useState("");

  // Origin Warehouses Dropdown (GET /api/warehouse/warehouses)
  const [warehousesList, setWarehousesList] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);

  // 3. Audit & Timeline Tracking State (GET /api/warehouse/track/:identifier)
  const [trackIdentifier, setTrackIdentifier] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // 4. Batch Container Reconciliation State (GET /api/warehouse/batches & GET /api/warehouse/batch/:batch_id/reconciliation)
  const [batchesList, setBatchesList] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [reconciliationData, setReconciliationData] = useState(null);
  const [reconciliationLoading, setReconciliationLoading] = useState(false);
  const [reconciliationFilter, setReconciliationFilter] = useState("all");

  // Modals State
  const [selectedShipmentDetail, setSelectedShipmentDetail] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    shipment_number: "",
    order_id: "",
    order_number: "",
    warehouse_reference: "",
    supplier_warehouse_order_id: "",
    total_boxes: 1,
    weight_kg: "",
    cbm: "",
    is_regenerate: false,
    overwrite: false,
  });

  const [generatedBarcodeResult, setGeneratedBarcodeResult] = useState(null);
  const [barcodePrintModalOpen, setBarcodePrintModalOpen] = useState(false);
  const [loadingReprint, setLoadingReprint] = useState(false);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [zplModalOpen, setZplModalOpen] = useState(false);
  const [zplCode, setZplCode] = useState("");
  const [zplLoading, setZplLoading] = useState(false);

  const printAreaRef = useRef(null);
  const auditPrintAreaRef = useRef(null);

  // ----------------------------------------------------
  // 1. TMS Shipments Fetch (GET /api/warehouse/shipments)
  // ----------------------------------------------------
  const fetchShipments = useCallback(
    async (page = 1, search = "", status = "all") => {
      setLoading(true);
      try {
        const baseUrl = getApiBaseUrl();
        const params = { page, limit };
        if (search.trim()) params.search = search.trim();
        if (status !== "all") params.status = status;

        const response = await axios.get(`${baseUrl}warehouse/shipments`, {
          params,
          headers: getAuthHeaders(),
        });

        if (response?.data?.success) {
          setShipments(response.data.shipments || []);
          setTotalShipments(response.data.total || 0);
          setTotalPages(response.data.total_pages || 1);
          setCurrentPage(response.data.page || 1);
        } else {
          setShipments(response.data.shipments || []);
        }
      } catch (error) {
        console.error("Error fetching warehouse shipments:", error);
        toast.error(error?.response?.data?.message || "Failed to load TMS shipments");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    if (activeTab === "shipments") {
      fetchShipments(currentPage, searchQuery, statusFilter);
    }
  }, [currentPage, searchQuery, statusFilter, activeTab, fetchShipments]);

  // ---------------------------------------------------------------------------------
  // 2. Fetch Origin Warehouses (GET /api/warehouse/warehouses)
  // ---------------------------------------------------------------------------------
  const fetchWarehouses = useCallback(async () => {
    setWarehousesLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.get(`${baseUrl}warehouse/warehouses`, {
        headers: getAuthHeaders(),
      });
      if (response?.data?.success) {
        setWarehousesList(response.data.origin_warehouses || []);
      }
    } catch (error) {
      console.error("Error fetching origin warehouses:", error);
    } finally {
      setWarehousesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // ---------------------------------------------------------------------------------
  // 3. Direct Consignments & Orders Fetch (POST /api/warehouse/orders)
  // ---------------------------------------------------------------------------------
  const fetchWarehouseOrders = useCallback(
    async (page = 1, search = "", status = "ALL", warehouseId = "") => {
      setOrdersLoading(true);
      try {
        const baseUrl = getApiBaseUrl();
        const payload = {
          page,
          limit: ordersLimit,
        };
        if (status && status !== "ALL") {
          payload.barcode_status = status;
        }
        if (warehouseId) {
          payload.origin_warehouse_id = Number(warehouseId);
        }
        if (search.trim()) {
          payload.search = search.trim();
        }

        const response = await axios.post(`${baseUrl}warehouse/orders`, payload, {
          headers: getAuthHeaders(),
        });

        if (response?.data?.success) {
          setOrdersList(response.data.orders || []);
          setTotalOrders(response.data.total || 0);
          setOrdersTotalPages(response.data.total_pages || 1);
          setOrdersPage(response.data.page || 1);
        } else {
          setOrdersList(response.data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching warehouse orders:", error);
        toast.error(error?.response?.data?.message || "Failed to load consignments");
      } finally {
        setOrdersLoading(false);
      }
    },
    [ordersLimit]
  );

  useEffect(() => {
    if (activeTab === "orders") {
      fetchWarehouseOrders(ordersPage, ordersSearch, ordersBarcodeStatus, ordersWarehouseId);
    }
  }, [ordersPage, ordersSearch, ordersBarcodeStatus, ordersWarehouseId, activeTab, fetchWarehouseOrders]);

  // ---------------------------------------------------------------------------------
  // 4. Audit & Timeline Tracking (GET /api/warehouse/track/:identifier)
  // ---------------------------------------------------------------------------------
  const fetchTrackingData = async (identifier) => {
    const query = String(identifier || "").trim();
    if (!query) {
      toast.warn("Please enter a box barcode, order #, or local reference");
      return;
    }

    setTrackingLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.get(
        `${baseUrl}warehouse/track/${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response?.data?.success) {
        setTrackingData(response.data);
        setTrackIdentifier(query);
        toast.success(`Tracking data loaded for: ${query}`);
      } else {
        toast.error(response?.data?.message || "No tracking records found");
      }
    } catch (error) {
      console.error("Error fetching tracking audit data:", error);
      toast.error(
        error?.response?.data?.message || `Tracking lookup failed for "${query}"`
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleOpenTrackingFromItem = (identifier) => {
    if (!identifier) return;
    setActiveTab("tracking");
    setTrackIdentifier(identifier);
    fetchTrackingData(identifier);
  };

  // ---------------------------------------------------------------------------------
  // 5. Container Batches & Reconciliation (GET /api/warehouse/batches & /reconciliation)
  // ---------------------------------------------------------------------------------
  const fetchBatches = useCallback(async () => {
    setBatchesLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.get(`${baseUrl}warehouse/batches`, {
        headers: getAuthHeaders(),
      });
      if (response?.data?.success) {
        setBatchesList(response.data.batches || []);
        if (response.data.batches?.length > 0 && !selectedBatchId) {
          const firstBatchId = response.data.batches[0].batch_id;
          setSelectedBatchId(firstBatchId);
          fetchBatchReconciliation(firstBatchId);
        }
      }
    } catch (error) {
      console.error("Error loading container batches:", error);
    } finally {
      setBatchesLoading(false);
    }
  }, [selectedBatchId]);

  const fetchBatchReconciliation = async (batchId) => {
    if (!batchId) return;
    setReconciliationLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.get(
        `${baseUrl}warehouse/batch/${batchId}/reconciliation`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (response?.data?.success) {
        setReconciliationData(response.data);
      } else {
        toast.error(response?.data?.message || "Could not load batch audit reconciliation");
      }
    } catch (error) {
      console.error("Error fetching reconciliation:", error);
      toast.error(error?.response?.data?.message || "Failed to load reconciliation");
    } finally {
      setReconciliationLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reconciliation" && batchesList.length === 0) {
      fetchBatches();
    }
  }, [activeTab, batchesList.length, fetchBatches]);

  // ---------------------------------------------------------------------------------
  // 6. Fetch Shipment Details (GET /api/warehouse/shipments/:identifier)
  // ---------------------------------------------------------------------------------
  const fetchShipmentDetails = async (identifier, autoOpen = true) => {
    if (!identifier) return;
    setDetailsLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.get(
        `${baseUrl}warehouse/shipments/${encodeURIComponent(identifier)}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response?.data?.success) {
        setSelectedShipmentDetail(response.data);
        if (autoOpen) {
          setDetailsModalOpen(true);
        }
        return response.data;
      } else {
        toast.error(response?.data?.message || "Could not retrieve shipment details");
      }
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      toast.error(error?.response?.data?.message || "Shipment not found");
    } finally {
      setDetailsLoading(false);
    }
    return null;
  };

  // Quick Scanner Banner Submit
  const handleScannerSubmit = async (e) => {
    e.preventDefault();
    const query = scannerInput.trim();
    if (!query) return;

    toast.info(`Looking up: ${query}...`);
    // Try Shipment Details first
    const details = await fetchShipmentDetails(query, true);
    if (details) {
      toast.success(`Found TMS Shipment: ${details.shipment_number || details.waybill}`);
    } else {
      // If not a full shipment, try tracking audit
      setActiveTab("tracking");
      setTrackIdentifier(query);
      fetchTrackingData(query);
    }
  };

  // ---------------------------------------------------------------------------------
  // 7. Barcode Generation Modal Handlers
  // ---------------------------------------------------------------------------------
  const handleOpenGenerateModal = (order, shipment = null, isRegenerate = false) => {
    const isGen =
      isRegenerate ||
      String(order?.barcode_status || "").toUpperCase() === "GENERATED";

    setGenerateForm({
      shipment_number: shipment?.shipment_number || shipment?.waybill || "",
      order_id: order?.order_id || "",
      order_number: order?.order_number || "",
      warehouse_reference:
        order?.warehouse_reference && order.warehouse_reference !== "N/A"
          ? order.warehouse_reference
          : order?.local_wh_ref ||
          shipment?.suggested_warehouse_ref ||
          shipment?.shipment_number ||
          "",
      supplier_warehouse_order_id: order?.supplier_warehouse_order_id || "",
      total_boxes:
        order?.packages && order.packages > 0
          ? order.packages
          : order?.total_packages && order.total_packages > 0
            ? order.total_packages
            : 1,
      weight_kg: order?.weight || order?.total_weight || "",
      cbm: order?.cbm || order?.total_cbm || "",
      is_regenerate: isGen,
      overwrite: isGen,
    });
    setGenerateModalOpen(true);
  };

  const handleGenerateBarcodesSubmit = async (e) => {
    e.preventDefault();
    if (!generateForm.total_boxes || generateForm.total_boxes < 1) {
      toast.error("Please enter a valid number of boxes (at least 1)");
      return;
    }

    setGenerating(true);
    try {
      const baseUrl = getApiBaseUrl();
      const payload = {
        total_boxes: Number(generateForm.total_boxes),
      };

      if (generateForm.is_regenerate || generateForm.overwrite) {
        payload.overwrite = true;
      }
      if (generateForm.supplier_warehouse_order_id) {
        payload.supplier_warehouse_order_id = generateForm.supplier_warehouse_order_id;
      }
      if (generateForm.warehouse_reference) {
        payload.warehouse_reference = generateForm.warehouse_reference;
      }
      if (generateForm.shipment_number) {
        payload.shipment_number = generateForm.shipment_number;
      }
      if (generateForm.order_id) {
        payload.order_id = generateForm.order_id;
      }
      if (generateForm.order_number) {
        payload.order_number = generateForm.order_number;
      }
      if (generateForm.weight_kg) {
        payload.weight_kg = Number(generateForm.weight_kg);
      }
      if (generateForm.cbm) {
        payload.cbm = Number(generateForm.cbm);
      }

      const response = await axios.post(
        `${baseUrl}warehouse/barcodes/generate`,
        payload,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response?.data?.success) {
        toast.success(
          response.data.message ||
          (payload.overwrite
            ? "Barcodes regenerated successfully!"
            : "Barcodes generated successfully!")
        );
        setGeneratedBarcodeResult(response.data);
        setGenerateModalOpen(false);
        setBarcodePrintModalOpen(true);

        if (selectedShipmentDetail?.shipment_id) {
          fetchShipmentDetails(selectedShipmentDetail.shipment_id, false);
        }
        if (activeTab === "shipments") {
          fetchShipments(currentPage, searchQuery, statusFilter);
        } else if (activeTab === "orders") {
          fetchWarehouseOrders(ordersPage, ordersSearch, ordersBarcodeStatus, ordersWarehouseId);
        }
      } else {
        toast.error(response?.data?.message || "Failed to generate barcodes");
      }
    } catch (error) {
      console.error("Error generating barcodes:", error);
      if (error?.response?.status === 409) {
        toast.warn("Barcodes already exist for this order. Set overwrite to regenerate.");
        setGenerateForm((prev) => ({
          ...prev,
          is_regenerate: true,
          overwrite: true,
        }));
      } else {
        toast.error(error?.response?.data?.message || "Error generating barcodes");
      }
    } finally {
      setGenerating(false);
    }
  };

  // ---------------------------------------------------------------------------------
  // 8. Reprint Barcodes (GET /api/warehouse/barcodes/reprint?reference=...)
  // ---------------------------------------------------------------------------------
  const handleFetchReprintBarcodes = async (reference) => {
    if (!reference || reference === "N/A") {
      toast.error("Invalid reference for barcode reprint");
      return;
    }

    setLoadingReprint(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.get(`${baseUrl}warehouse/barcodes/reprint`, {
        params: { reference },
        headers: getAuthHeaders(),
      });

      if (response?.data?.success) {
        setGeneratedBarcodeResult(response.data);
        setBarcodePrintModalOpen(true);
      } else {
        toast.error(response?.data?.message || "No barcodes found for this reference");
      }
    } catch (error) {
      console.error("Error fetching reprint barcodes:", error);
      toast.error(
        error?.response?.data?.message || "Could not retrieve barcodes for this reference"
      );
    } finally {
      setLoadingReprint(false);
    }
  };

  // ---------------------------------------------------------------------------------
  // 9. Download 4x6 PDF Labels (GET /api/warehouse/labels/pdf?reference=...)
  // ---------------------------------------------------------------------------------
  const handleDownloadPdfLabels = async (reference) => {
    const ref =
      reference ||
      generatedBarcodeResult?.order_number ||
      generatedBarcodeResult?.warehouse_reference ||
      selectedShipmentDetail?.shipment_number;

    if (!ref) {
      toast.error("Reference is required for PDF labels");
      return;
    }

    setPdfLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.get(`${baseUrl}warehouse/labels/pdf`, {
        params: { reference: ref },
        headers: getAuthHeaders(),
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);

      const newTab = window.open(blobUrl, "_blank");
      if (!newTab) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", `4x6_labels_${ref}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Error downloading PDF labels:", error);
      toast.error("Failed to generate PDF labels");
    } finally {
      setPdfLoading(false);
    }
  };

  // ---------------------------------------------------------------------------------
  // 10. Fetch Zebra ZPL Code (GET /api/warehouse/labels/zpl?reference=...)
  // ---------------------------------------------------------------------------------
  const handleFetchZplCode = async (reference) => {
    const ref =
      reference ||
      generatedBarcodeResult?.order_number ||
      generatedBarcodeResult?.warehouse_reference ||
      selectedShipmentDetail?.shipment_number;

    if (!ref) {
      toast.error("Reference is required for ZPL thermal code");
      return;
    }

    setZplLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.get(`${baseUrl}warehouse/labels/zpl`, {
        params: { reference: ref },
        headers: getAuthHeaders(),
      });

      if (response?.data?.success && response?.data?.zpl) {
        setZplCode(response.data.zpl);
        setZplModalOpen(true);
      } else {
        toast.error(response?.data?.message || "ZPL code could not be retrieved");
      }
    } catch (error) {
      console.error("Error fetching ZPL code:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch ZPL code");
    } finally {
      setZplLoading(false);
    }
  };

  const handleDownloadZplFile = () => {
    if (!zplCode) return;
    const blob = new Blob([zplCode], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const ref =
      generatedBarcodeResult?.order_number ||
      generatedBarcodeResult?.warehouse_reference ||
      "labels";
    link.href = url;
    link.setAttribute("download", `zebra_labels_${ref}.zpl`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("ZPL file downloaded!");
  };

  // Browser Label Print
  const handlePrintLabels = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;
    const windowPrint = window.open("", "", "width=900,height=700");
    windowPrint.document.write(`
      <html>
        <head>
          <title>Print Box Barcodes - ${generatedBarcodeResult?.order_number ||
      generatedBarcodeResult?.warehouse_reference ||
      "Labels"
      }</title>
          <style>
            @media print {
              @page { size: auto; margin: 6mm; }
              .no-print { display: none !important; }
              .barcode-card { page-break-inside: avoid; margin-bottom: 12px !important; }
            }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #fff; padding: 10px; color: #0f172a; }
            .grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
            .barcode-card { border: 2px solid #0f172a; border-radius: 8px; padding: 14px; text-align: center; background: #fff; box-sizing: border-box; }
            .badge-box { background: #0f172a; color: #fff; font-weight: bold; font-size: 13px; padding: 3px 8px; border-radius: 4px; display: inline-block; }
            .company-hd { font-size: 14px; font-weight: 800; letter-spacing: 0.5px; color: #1e3a8a; margin-bottom: 2px; }
            .sub-hd { font-size: 10px; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
            .barcode-svg-container { width: 100%; display: flex; justify-content: center; margin: 8px 0; }
            .barcode-svg-container svg { max-width: 100% !important; height: auto !important; }
            .info-table { width: 100%; font-size: 11px; margin-top: 8px; border-collapse: collapse; text-align: left; }
            .info-table td { padding: 3px 5px; border-bottom: 1px solid #e2e8f0; }
            .info-table td.lbl { font-weight: bold; color: #475569; width: 38%; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  // Browser Audit Reconciliation Report Print
  const handlePrintAuditReport = () => {
    const auditContent = auditPrintAreaRef.current;
    if (!auditContent) return;
    const windowPrint = window.open("", "", "width=950,height=750");
    windowPrint.document.write(`
      <html>
        <head>
          <title>Container Audit Reconciliation Report - Batch ${reconciliationData?.batch?.batch_number || "Audit"}</title>
          <style>
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              .no-print { display: none !important; }
            }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #fff; padding: 15px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            .badge { padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; display: inline-block; }
            .badge-loaded { background: #dcfce7; color: #15803d; }
            .badge-pending { background: #fee2e2; color: #b91c1c; }
          </style>
        </head>
        <body>
          ${auditContent.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  const copyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Copied "${text}" to clipboard!`);
  };

  const renderBarcodeStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "GENERATED") {
      return (
        <span
          className="badge bg-success-subtle text-success border border-success d-inline-flex align-items-center gap-1"
          style={{ fontSize: "12px", padding: "5px 10px", borderRadius: "12px" }}
        >
          <FiCheckCircle style={{ fontSize: "14px" }} /> GENERATED
        </span>
      );
    }
    if (s === "PARTIALLY_GENERATED") {
      return (
        <span
          className="badge bg-warning-subtle text-warning border border-warning d-inline-flex align-items-center gap-1"
          style={{ fontSize: "12px", padding: "5px 10px", borderRadius: "12px" }}
        >
          <FiAlertTriangle style={{ fontSize: "14px" }} /> PARTIALLY GENERATED
        </span>
      );
    }
    return (
      <span
        className="badge bg-secondary-subtle text-secondary border border-secondary d-inline-flex align-items-center gap-1"
        style={{ fontSize: "12px", padding: "5px 10px", borderRadius: "12px" }}
      >
        <FiXCircle style={{ fontSize: "14px" }} /> NOT GENERATED
      </span>
    );
  };

  return (
    <div className="wpWrapper">
      {/* High-Specificity Scoped CSS for Perfect Table Action Button Rendering */}
      <style>{`
        div.wpWrapper table td .d-flex button.shipment-details-btn,
        div.wpWrapper table td button.shipment-details-btn,
        div.wpWrapper .shipment-details-btn,
        .shipment-details-btn,
        td .d-flex .shipment-details-btn,
        td .shipment-details-btn,
        button.shipment-details-btn {
          background-color: #1b2245 !important;
          background: #1b2245 !important;
          color: #ffffff !important;
          border: 1px solid #1b2245 !important;
          padding: 6px 14px !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          cursor: pointer !important;
          text-decoration: none !important;
          box-shadow: 0 2px 5px rgba(27, 34, 69, 0.25) !important;
          transition: all 0.2s ease !important;
          line-height: 1.4 !important;
        }
        div.wpWrapper table td .d-flex button.shipment-details-btn:hover,
        div.wpWrapper table td button.shipment-details-btn:hover,
        div.wpWrapper .shipment-details-btn:hover,
        .shipment-details-btn:hover,
        td .d-flex .shipment-details-btn:hover,
        td .shipment-details-btn:hover,
        button.shipment-details-btn:hover {
          background-color: #2563eb !important;
          background: #2563eb !important;
          border-color: #2563eb !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35) !important;
        }
        div.wpWrapper table td .d-flex button.shipment-details-btn svg,
        div.wpWrapper table td .d-flex button.shipment-details-btn span,
        div.wpWrapper .shipment-details-btn svg,
        div.wpWrapper .shipment-details-btn span,
        .shipment-details-btn svg,
        .shipment-details-btn span,
        button.shipment-details-btn svg,
        button.shipment-details-btn span {
          color: #ffffff !important;
          stroke: #ffffff !important;
          fill: none !important;
        }

        div.wpWrapper table td .d-flex button.tms-action-view-btn,
        div.wpWrapper table td button.tms-action-view-btn,
        div.wpWrapper .tms-action-view-btn,
        .tms-action-view-btn,
        td .d-flex .tms-action-view-btn,
        td .tms-action-view-btn,
        button.tms-action-view-btn {
          background-color: #ecfdf5 !important;
          background: #ecfdf5 !important;
          color: #059669 !important;
          border: 1px solid #10b981 !important;
          padding: 5px 12px !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          cursor: pointer !important;
          line-height: 1.4 !important;
        }
        div.wpWrapper table td .d-flex button.tms-action-view-btn:hover,
        div.wpWrapper table td button.tms-action-view-btn:hover,
        .tms-action-view-btn:hover,
        button.tms-action-view-btn:hover {
          background-color: #d1fae5 !important;
          background: #d1fae5 !important;
          color: #047857 !important;
        }
        div.wpWrapper table td .d-flex button.tms-action-view-btn svg,
        div.wpWrapper table td .d-flex button.tms-action-view-btn span,
        .tms-action-view-btn svg,
        .tms-action-view-btn span,
        button.tms-action-view-btn svg,
        button.tms-action-view-btn span {
          color: #059669 !important;
        }

        div.wpWrapper table td .d-flex button.tms-action-regen-btn,
        div.wpWrapper table td button.tms-action-regen-btn,
        div.wpWrapper .tms-action-regen-btn,
        .tms-action-regen-btn,
        td .d-flex .tms-action-regen-btn,
        td .tms-action-regen-btn,
        button.tms-action-regen-btn {
          background-color: #fffbeb !important;
          background: #fffbeb !important;
          color: #b45309 !important;
          border: 1px solid #f59e0b !important;
          padding: 5px 12px !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          cursor: pointer !important;
          line-height: 1.4 !important;
        }
        div.wpWrapper table td .d-flex button.tms-action-regen-btn:hover,
        div.wpWrapper table td button.tms-action-regen-btn:hover,
        .tms-action-regen-btn:hover,
        button.tms-action-regen-btn:hover {
          background-color: #fef3c7 !important;
          background: #fef3c7 !important;
          color: #92400e !important;
        }
        div.wpWrapper table td .d-flex button.tms-action-regen-btn svg,
        div.wpWrapper table td .d-flex button.tms-action-regen-btn span,
        .tms-action-regen-btn svg,
        .tms-action-regen-btn span,
        button.tms-action-regen-btn svg,
        button.tms-action-regen-btn span {
          color: #b45309 !important;
        }

        div.wpWrapper table td .d-flex button.tms-action-gen-btn,
        div.wpWrapper table td button.tms-action-gen-btn,
        div.wpWrapper .tms-action-gen-btn,
        .tms-action-gen-btn,
        td .d-flex .tms-action-gen-btn,
        td .tms-action-gen-btn,
        button.tms-action-gen-btn {
          background-color: #2563eb !important;
          background: #2563eb !important;
          color: #ffffff !important;
          border: 1px solid #2563eb !important;
          padding: 5px 14px !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          cursor: pointer !important;
          line-height: 1.4 !important;
        }
        div.wpWrapper table td .d-flex button.tms-action-gen-btn:hover,
        div.wpWrapper table td button.tms-action-gen-btn:hover,
        .tms-action-gen-btn:hover,
        button.tms-action-gen-btn:hover {
          background-color: #1d4ed8 !important;
          background: #1d4ed8 !important;
          color: #ffffff !important;
        }
        div.wpWrapper table td .d-flex button.tms-action-gen-btn svg,
        div.wpWrapper table td .d-flex button.tms-action-gen-btn span,
        .tms-action-gen-btn svg,
        .tms-action-gen-btn span,
        button.tms-action-gen-btn svg,
        button.tms-action-gen-btn span {
          color: #ffffff !important;
        }

        div.wpWrapper table td .d-flex button.tms-action-track-btn,
        div.wpWrapper table td button.tms-action-track-btn,
        div.wpWrapper .tms-action-track-btn,
        .tms-action-track-btn,
        td .d-flex .tms-action-track-btn,
        td .tms-action-track-btn,
        button.tms-action-track-btn {
          background-color: #f1f5f9 !important;
          background: #f1f5f9 !important;
          color: #334155 !important;
          border: 1px solid #cbd5e1 !important;
          padding: 5px 11px !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          cursor: pointer !important;
          line-height: 1.4 !important;
        }
        div.wpWrapper table td .d-flex button.tms-action-track-btn:hover,
        div.wpWrapper table td button.tms-action-track-btn:hover,
        .tms-action-track-btn:hover,
        button.tms-action-track-btn:hover {
          background-color: #e2e8f0 !important;
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }
        div.wpWrapper table td .d-flex button.tms-action-track-btn svg,
        div.wpWrapper table td .d-flex button.tms-action-track-btn span,
        .tms-action-track-btn svg,
        .tms-action-track-btn span,
        button.tms-action-track-btn svg,
        button.tms-action-track-btn span {
          color: #334155 !important;
        }

        /* Brand Action & Primary Buttons (.btn_batch, .blueBtn) */
        div.wpWrapper button.btn_batch,
        div.wpWrapper .btn_batch,
        button.btn_batch,
        .btn_batch,
        div.wpWrapper button.blueBtn,
        div.wpWrapper .blueBtn,
        button.blueBtn,
        .blueBtn {
          background-color: #1b2245 !important;
          background: #1b2245 !important;
          color: #ffffff !important;
          border: 1px solid #1b2245 !important;
          padding: 7px 16px !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          cursor: pointer !important;
          text-decoration: none !important;
          box-shadow: 0 2px 5px rgba(27, 34, 69, 0.25) !important;
          transition: all 0.2s ease !important;
          line-height: 1.4 !important;
        }
        div.wpWrapper button.btn_batch:hover,
        div.wpWrapper .btn_batch:hover,
        button.btn_batch:hover,
        .btn_batch:hover,
        div.wpWrapper button.blueBtn:hover,
        div.wpWrapper .blueBtn:hover,
        button.blueBtn:hover,
        .blueBtn:hover {
          background-color: #2563eb !important;
          background: #2563eb !important;
          border-color: #2563eb !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35) !important;
        }
        div.wpWrapper button.btn_batch svg,
        div.wpWrapper button.btn_batch span,
        button.btn_batch svg,
        button.btn_batch span,
        .btn_batch svg,
        .btn_batch span,
        div.wpWrapper button.blueBtn svg,
        div.wpWrapper button.blueBtn span,
        button.blueBtn svg,
        button.blueBtn span,
        .blueBtn svg,
        .blueBtn span {
          color: #ffffff !important;
          stroke: #ffffff !important;
          fill: none !important;
        }

        .nav-pills-tms .nav-link {
          color: #475569;
          font-weight: 600;
          font-size: 13.5px;
          border-radius: 8px;
          padding: 9px 18px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .nav-pills-tms .nav-link.active {
          background-color: #1b2245 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(27, 34, 69, 0.2);
        }
        .nav-pills-tms .nav-link:hover:not(.active) {
          background-color: #f1f5f9;
          color: #0f172a;
        }
      `}</style>

      <div className="container-fluid">
        {/* Module Header */}
        <div className="row manageFreight">
          <div className="col-12">
            <div className="d-flex justify-content-between my-3 align-items-center flex-wrap gap-2">
              <div>
                <h4 className="freight_hd mb-0">Scanning & Tracking Orders</h4>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="blueBtn btn_batch d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: "#1b2245",
                    color: "#ffffff",
                    border: "1px solid #1b2245",
                    padding: "7px 16px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                  onClick={() => {
                    if (activeTab === "shipments") fetchShipments(currentPage, searchQuery, statusFilter);
                    else if (activeTab === "orders") fetchWarehouseOrders(ordersPage, ordersSearch, ordersBarcodeStatus, ordersWarehouseId);
                    else if (activeTab === "tracking" && trackIdentifier) fetchTrackingData(trackIdentifier);
                    else if (activeTab === "reconciliation" && selectedBatchId) fetchBatchReconciliation(selectedBatchId);
                  }}
                  title="Refresh Current Data"
                >
                  <FiRefreshCw className={loading || ordersLoading || trackingLoading || reconciliationLoading ? "spin-icon" : ""} style={{ color: "#ffffff" }} />
                  <span style={{ color: "#ffffff" }}>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Unified Tabs System */}
        <div className="unified-tabs-container mb-3">
          <button
            className={`unified-tab-btn ${activeTab === "shipments" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("shipments");
              setCurrentPage(1);
            }}
          >
            TMS Shipments
          </button>
          <button
            className={`unified-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("orders");
              setOrdersPage(1);
            }}
          >
            Direct Consignments {totalOrders > 0 ? `(${totalOrders})` : ""}
          </button>
          <button
            className={`unified-tab-btn ${activeTab === "tracking" ? "active" : ""}`}
            onClick={() => setActiveTab("tracking")}
          >
            Audit & Tracking
          </button>
          <button
            className={`unified-tab-btn ${activeTab === "reconciliation" ? "active" : ""}`}
            onClick={() => setActiveTab("reconciliation")}
          >
            Batch Reconciliation
          </button>
        </div>

        {/* --------------------------------------------------------------------------------- */}
        {/* TAB 1: TMS SHIPMENTS & MANIFESTS LIST                                             */}
        {/* --------------------------------------------------------------------------------- */}
        {activeTab === "shipments" && (
          <>
            {/* Search Bar matching Asia Direct layout */}
            <div className="d-flex justify-content-between align-items-center my-3">
              <div className="searchManageFre">
                <input
                  type="text"
                  placeholder="Search shipment, waybill, vessel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="loader-container" style={{ height: "40vh", background: "transparent" }}>
                <div className="loader"></div>
                <p className="loader-text">Loading shipments...</p>
              </div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No TMS shipments found</p>
              </div>
            ) : (
              <div className="table-responsive mt-3">
                <table className="table table-striped tableICon">
                  <thead>
                    <tr>
                      <th>Shipment / Waybill</th>
                      <th>Carrier & Vessel</th>
                      <th>Route</th>
                      <th>Mode</th>
                      <th>Total Orders</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((item) => (
                      <tr key={item.shipment_id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold" style={{ color: "#1b2245" }}>
                              {item.shipment_number || item.waybill}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-link p-0 text-secondary"
                              onClick={() => copyText(item.shipment_number || item.waybill)}
                              title="Copy Shipment Number"
                            >
                              <FiCopy style={{ fontSize: "14px" }} />
                            </button>
                          </div>
                          {item.container && (
                            <small className="text-muted d-block" style={{ fontSize: "12px" }}>
                              Cont: {item.container}
                            </small>
                          )}
                        </td>
                        <td>
                          <div className="fw-semibold text-dark" style={{ fontSize: "13px" }}>
                            {item.carrier || "N/A"}
                          </div>
                          <small className="text-muted">{item.vessel || ""}</small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1" style={{ fontSize: "13px" }}>
                            <span>{item.origin_country_name || "Origin"}</span>
                            <FiArrowRight style={{ fontSize: "12px", color: "#64748b" }} />
                            <span className="fw-semibold">{item.destination_country_name || "Destination"}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${item.freight_mode?.toLowerCase() === "sea"
                                ? "bg-info-subtle text-info border border-info"
                                : "bg-primary-subtle text-primary border border-primary"
                              }`}
                            style={{ padding: "4px 8px", borderRadius: "6px" }}
                          >
                            {item.freight_mode || "Standard"}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border px-2 py-1">
                            {item.total_orders || 0} Orders
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${item.status?.toLowerCase().includes("delivered")
                                ? "bg-success-subtle text-success border border-success"
                                : item.status?.toLowerCase().includes("transit")
                                  ? "bg-warning-subtle text-warning border border-warning"
                                  : "bg-secondary-subtle text-secondary border border-secondary"
                              }`}
                            style={{ padding: "4px 8px", borderRadius: "6px" }}
                          >
                            {item.status || "In Transit"}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString("en-GB") : "Recent"}
                          </small>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end align-items-center gap-2">
                            <button
                              type="button"
                              className="shipment-details-btn"
                              style={{
                                backgroundColor: "#1b2245",
                                background: "#1b2245",
                                color: "#ffffff",
                                border: "1px solid #1b2245",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                fontWeight: "600",
                                fontSize: "13px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                cursor: "pointer",
                                textDecoration: "none",
                                lineHeight: "1.4",
                              }}
                              onClick={() => fetchShipmentDetails(item.shipment_id)}
                              title="View Shipment Details & Associated Orders"
                            >
                              <FiEye style={{ fontSize: "14px", color: "#ffffff", stroke: "#ffffff" }} />
                              <span style={{ color: "#ffffff", fontWeight: "600" }}>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="mt-3">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalShipments}
                    itemsPerPage={limit}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* --------------------------------------------------------------------------------- */}
        {/* TAB 2: DIRECT CONSIGNMENTS & ORDERS SEARCH (POST /api/warehouse/orders)          */}
        {/* --------------------------------------------------------------------------------- */}
        {activeTab === "orders" && (
          <>
            {/* Filter Controls Toolbar */}
            <div className="d-flex flex-wrap gap-2 align-items-center my-3">
              <div className="searchManageFre">
                <input
                  type="text"
                  placeholder="Search consignment / order # / customer..."
                  value={ordersSearch}
                  onChange={(e) => setOrdersSearch(e.target.value)}
                />
              </div>

              {/* Barcode Status Filter */}
              <div style={{ minWidth: "160px" }}>
                <select
                  className="form-control"
                  style={{ height: "38px", fontSize: "13px" }}
                  value={ordersBarcodeStatus}
                  onChange={(e) => {
                    setOrdersBarcodeStatus(e.target.value);
                    setOrdersPage(1);
                  }}
                >
                  <option value="ALL">All Barcode Statuses</option>
                  <option value="GENERATED">✔ GENERATED</option>
                  <option value="NOT_GENERATED">✖ NOT_GENERATED</option>
                </select>
              </div>

              {/* Origin Warehouse Dropdown */}
              <div style={{ minWidth: "180px" }}>
                <select
                  className="form-control"
                  style={{ height: "38px", fontSize: "13px" }}
                  value={ordersWarehouseId}
                  onChange={(e) => {
                    setOrdersWarehouseId(e.target.value);
                    setOrdersPage(1);
                  }}
                  disabled={warehousesLoading}
                >
                  <option value="">All Origin Warehouses</option>
                  {warehousesList.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.warehouse_name} ({wh.country_name || "Depot"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters Button */}
              {(ordersSearch || ordersBarcodeStatus !== "ALL" || ordersWarehouseId) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setOrdersSearch("");
                    setOrdersBarcodeStatus("ALL");
                    setOrdersWarehouseId("");
                    setOrdersPage(1);
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Consignments Table */}
            {ordersLoading ? (
              <div className="loader-container" style={{ height: "40vh", background: "transparent" }}>
                <div className="loader"></div>
                <p className="loader-text">Loading consignments...</p>
              </div>
            ) : ordersList.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No consignments matching criteria</p>
              </div>
            ) : (
              <div className="table-responsive mt-3">
                <table className="table table-striped tableICon">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Local Wh Ref</th>
                      <th>Customer</th>
                      <th>Supplier</th>
                      <th>Origin Warehouse</th>
                      <th>Boxes</th>
                      <th>Weight / CBM</th>
                      <th>Goods Description</th>
                      <th>Barcode Status</th>
                      <th className="text-end" style={{ minWidth: "240px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.map((ord, idx) => {
                      const isGenerated = String(ord.barcode_status || "").toUpperCase() === "GENERATED";
                      const refKey = ord.order_number || ord.local_wh_ref || `OR000${ord.order_id}`;

                      return (
                        <tr key={ord.supplier_warehouse_order_id || ord.order_id || idx}>
                          <td>
                            <span className="fw-semibold" style={{ color: "#1b2245" }}>
                              {ord.order_number || `Order #${ord.order_id}`}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary">
                              {ord.local_wh_ref || "N/A"}
                            </span>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark" style={{ fontSize: "13px" }}>
                              {ord.customer_name || ord.customer_ref || "N/A"}
                            </div>
                            <small className="text-muted">Dest: {ord.destination_country_name || "South Africa"}</small>
                          </td>
                          <td>
                            <span className="text-dark">{ord.supplier_name || "N/A"}</span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {ord.origin_warehouse_name || "AD Warehouse"}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1">
                              {ord.total_packages || 1} Box(es)
                            </span>
                          </td>
                          <td>
                            <small className="text-muted d-block">
                              {ord.total_weight ? `${ord.total_weight} kg` : "—"}
                            </small>
                            <small className="text-muted">
                              {ord.total_cbm ? `${ord.total_cbm} CBM` : "—"}
                            </small>
                          </td>
                          <td>
                            <span
                              className="text-truncate d-inline-block fw-medium"
                              style={{
                                maxWidth: "160px",
                                color: ord.goods_description ? "#0f172a" : "#64748b",
                                fontSize: "12.5px",
                              }}
                              title={ord.goods_description || "No description"}
                            >
                              {ord.goods_description || "—"}
                            </span>
                          </td>
                          <td>{renderBarcodeStatusBadge(ord.barcode_status)}</td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end align-items-center gap-2">
                              {isGenerated ? (
                                <>
                                  <button
                                    type="button"
                                    className="tms-action-view-btn shadow-sm"
                                    style={{
                                      backgroundColor: "#ecfdf5",
                                      background: "#ecfdf5",
                                      color: "#059669",
                                      border: "1px solid #10b981",
                                      padding: "5px 12px",
                                      borderRadius: "6px",
                                      fontWeight: "600",
                                      fontSize: "12px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      cursor: "pointer",
                                      lineHeight: "1.4",
                                    }}
                                    onClick={() => handleFetchReprintBarcodes(refKey)}
                                    disabled={loadingReprint}
                                    title="View & Print Box Barcode Labels (4x6 PDF / ZPL)"
                                  >
                                    <FiEye style={{ fontSize: "14px", color: "#059669", stroke: "#059669" }} />
                                    <span style={{ color: "#059669", fontWeight: "600" }}>Labels</span>
                                  </button>

                                  <button
                                    type="button"
                                    className="tms-action-regen-btn shadow-sm"
                                    style={{
                                      backgroundColor: "#fffbeb",
                                      background: "#fffbeb",
                                      color: "#b45309",
                                      border: "1px solid #f59e0b",
                                      padding: "5px 12px",
                                      borderRadius: "6px",
                                      fontWeight: "600",
                                      fontSize: "12px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      cursor: "pointer",
                                      lineHeight: "1.4",
                                    }}
                                    onClick={() => handleOpenGenerateModal(ord, null, true)}
                                    title="Regenerate barcodes (sends overwrite: true)"
                                  >
                                    <FiRefreshCw style={{ fontSize: "13px", color: "#b45309", stroke: "#b45309" }} />
                                    <span style={{ color: "#b45309", fontWeight: "600" }}>Regen</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="tms-action-gen-btn shadow-sm"
                                  style={{
                                    backgroundColor: "#2563eb",
                                    background: "#2563eb",
                                    color: "#ffffff",
                                    border: "1px solid #2563eb",
                                    padding: "5px 14px",
                                    borderRadius: "6px",
                                    fontWeight: "600",
                                    fontSize: "12px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    cursor: "pointer",
                                    lineHeight: "1.4",
                                  }}
                                  onClick={() => handleOpenGenerateModal(ord, null, false)}
                                  title="Generate box barcodes"
                                >
                                  <FiBox style={{ fontSize: "13px", color: "#ffffff", stroke: "#ffffff" }} />
                                  <span style={{ color: "#ffffff", fontWeight: "600" }}>Generate</span>
                                </button>
                              )}

                              <button
                                type="button"
                                className="tms-action-track-btn shadow-sm"
                                style={{
                                  backgroundColor: "#f1f5f9",
                                  background: "#f1f5f9",
                                  color: "#334155",
                                  border: "1px solid #cbd5e1",
                                  padding: "5px 11px",
                                  borderRadius: "6px",
                                  fontWeight: "600",
                                  fontSize: "12px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  cursor: "pointer",
                                  lineHeight: "1.4",
                                }}
                                onClick={() => handleOpenTrackingFromItem(refKey)}
                                title="View Full Audit & Timeline Tracking"
                              >
                                <FiActivity style={{ fontSize: "13px", color: "#334155", stroke: "#334155" }} />
                                <span style={{ color: "#334155", fontWeight: "600" }}>Track</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Orders Pagination */}
                <div className="mt-3">
                  <CustomPagination
                    currentPage={ordersPage}
                    totalPages={ordersTotalPages}
                    totalItems={totalOrders}
                    itemsPerPage={ordersLimit}
                    onPageChange={(p) => setOrdersPage(p)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* --------------------------------------------------------------------------------- */}
        {/* TAB 3: AUDIT & TIMELINE TRACKING + DAMAGED BOX PHOTOS (GET /api/warehouse/track) */}
        {/* --------------------------------------------------------------------------------- */}
        {activeTab === "tracking" && (
          <>
            {/* Search Lookup Bar in Asia Direct Style */}
            <div className="my-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchTrackingData(trackIdentifier);
                }}
                className="d-flex gap-2 flex-wrap"
                style={{ maxWidth: "600px" }}
              >
                <div className="searchManageFre flex-grow-1">
                  <input
                    type="text"
                    placeholder="Enter Box Barcode (e.g. 4534-OR0001125-001-002-3) or Order #..."
                    value={trackIdentifier}
                    onChange={(e) => setTrackIdentifier(e.target.value)}
                    style={{ width: "100%" }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="blueBtn btn_batch d-flex align-items-center justify-content-center gap-2"
                  disabled={trackingLoading}
                  style={{
                    height: "38px",
                    backgroundColor: "#1b2245",
                    color: "#ffffff",
                    border: "1px solid #1b2245",
                    padding: "0 20px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  <FiSearch style={{ color: "#ffffff" }} />
                  <span style={{ color: "#ffffff" }}>{trackingLoading ? "Searching..." : "Track"}</span>
                </button>
              </form>
            </div>

            {/* Tracking Results View */}
            {trackingLoading ? (
              <div className="loader-container" style={{ height: "40vh", background: "transparent" }}>
                <div className="loader"></div>
                <p className="loader-text">Loading tracking timeline...</p>
              </div>
            ) : trackingData ? (
              <div className="mt-4">
                {/* Overview Cards Grid */}
                <div className="row g-3 mb-4">
                  <div className="col-lg-3 col-sm-6">
                    <div className="p-3 bg-white rounded border shadow-sm h-100">
                      <small className="text-muted d-block">Order Reference</small>
                      <h5 className="fw-bold mb-1 font-monospace" style={{ color: "#1b2245" }}>
                        {trackingData.order_summary?.order_number || trackingData.box?.order_number || "N/A"}
                      </h5>
                      <small className="text-muted d-block">
                        Ref: <strong>{trackingData.order_summary?.warehouse_reference || trackingData.box?.warehouse_order_number || "N/A"}</strong>
                      </small>
                      {trackingData.box?.barcode_string && (
                        <span
                          className="badge bg-light text-dark border mt-1 font-monospace"
                          style={{ fontSize: "11px" }}
                        >
                          Box: {trackingData.box.barcode_string}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-3 col-sm-6">
                    <div className="p-3 bg-white rounded border shadow-sm h-100">
                      <small className="text-muted d-block">Consignment Status</small>
                      <div className="mt-1">
                        <span
                          className="badge text-white px-3 py-1 rounded-pill"
                          style={{ backgroundColor: "#1b2245", fontSize: "12px" }}
                        >
                          {trackingData.order_summary?.current_track_status ||
                            trackingData.box?.order_track_status ||
                            trackingData.box?.current_status ||
                            "Dispatched"}
                        </span>
                      </div>
                      <small className="text-muted mt-2 d-block">
                        Origin: <strong>{trackingData.box?.origin_name || "Warehouse"}</strong>
                      </small>
                      <small className="text-muted d-block">
                        Dest: <strong>{trackingData.box?.dest_name || "South Africa"}</strong>
                      </small>
                    </div>
                  </div>

                  <div className="col-lg-3 col-sm-6">
                    <div className="p-3 bg-white rounded border shadow-sm h-100">
                      <small className="text-muted d-block">Consignment Cartons</small>
                      <h4 className="fw-bold text-dark mb-0 mt-1">
                        {trackingData.order_summary?.total_boxes ||
                          trackingData.all_boxes_in_consignment?.length ||
                          trackingData.box?.total_boxes ||
                          1}{" "}
                        <span style={{ fontSize: "14px", fontWeight: "normal", color: "#64748b" }}>Boxes</span>
                      </h4>
                      <small className="text-muted d-block mt-1">
                        Weight: <strong>{trackingData.box?.weight_kg ? `${trackingData.box.weight_kg} kg` : "Standard"}</strong>
                        {trackingData.box?.cbm && ` • ${trackingData.box.cbm} CBM`}
                      </small>
                    </div>
                  </div>

                  <div className="col-lg-3 col-sm-6">
                    <div className="p-3 bg-white rounded border shadow-sm h-100">
                      <small className="text-muted d-block">Damage Assessment</small>
                      <h6
                        className={`fw-bold mb-1 ${trackingData.order_summary?.is_damaged || trackingData.box?.is_damaged
                            ? "text-danger"
                            : "text-success"
                          }`}
                      >
                        {trackingData.order_summary?.is_damaged || trackingData.box?.is_damaged
                          ? "⚠ DAMAGE REPORTED"
                          : "✔ ALL BOXES INTACT"}
                      </h6>
                      <small className="text-muted d-block">
                        {trackingData.attachments?.length || 0} Damage Photo(s) Attached
                      </small>
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  {/* Left Column: Timeline Events */}
                  <div className="col-lg-6">
                    <div className="border rounded bg-white p-3 shadow-sm h-100 d-flex flex-column">
                      <h6 className="fw-bold border-bottom pb-2 mb-3" style={{ color: "#1b2245" }}>
                        <FiClock className="me-1" /> Timeline Scan History
                      </h6>
                      {trackingData.timeline && trackingData.timeline.length > 0 ? (
                        <div
                          className="timeline-container ps-3 flex-grow-1"
                          style={{
                            borderLeft: "2px solid #1b2245",
                            maxHeight: "380px",
                            overflowY: "auto",
                            paddingRight: "8px",
                          }}
                        >
                          {trackingData.timeline.map((evt, idx) => (
                            <div key={idx} className="mb-3">
                              <div className="d-flex justify-content-between">
                                <span className="badge bg-dark text-white text-uppercase">
                                  {evt.event?.replace("_", " ") || "SCAN EVENT"}
                                </span>
                                <small className="text-muted">
                                  {evt.timestamp ? new Date(evt.timestamp).toLocaleString("en-GB") : ""}
                                </small>
                              </div>
                              {evt.location && (
                                <small className="d-block text-secondary mt-1">
                                  Location: <strong className="text-dark">{evt.location}</strong>
                                </small>
                              )}
                              {evt.operator && (
                                <small className="d-block text-secondary">
                                  Scanned By: <strong className="text-dark">{evt.operator}</strong>
                                </small>
                              )}
                              {evt.notes && (
                                <p className="mb-0 mt-1 text-muted fst-italic small">Note: {evt.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="ps-3" style={{ borderLeft: "2px solid #10b981" }}>
                          <span className="badge bg-success text-white text-uppercase">
                            BARCODES REGISTERED & DISPATCHED
                          </span>
                          <small className="text-muted d-block mt-1">
                            {trackingData.box?.created_at
                              ? new Date(trackingData.box.created_at).toLocaleString("en-GB")
                              : "Recently Created"}
                          </small>
                          <small className="text-secondary d-block mt-1">
                            Origin Warehouse: <strong className="text-dark">{trackingData.box?.origin_name || "AD Warehouse"}</strong>
                          </small>
                          <p className="mb-0 mt-1 text-muted small">
                            Consignment is active with status: <strong>{trackingData.order_summary?.current_track_status || trackingData.box?.order_track_status || "Dispatched to port"}</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Boxes Breakdown & Damage Photo Gallery */}
                  <div className="col-lg-6">
                    {/* All Boxes in Consignment */}
                    <div className="border rounded bg-white p-3 shadow-sm mb-3">
                      <h6 className="fw-bold border-bottom pb-2 mb-3" style={{ color: "#1b2245" }}>
                        <FiPackage className="me-1" /> Boxes in Consignment ({trackingData.all_boxes_in_consignment?.length || 0})
                      </h6>
                      <div
                        className="table-responsive"
                        style={{
                          maxHeight: "380px",
                          overflowY: "auto",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                        }}
                      >
                        <table className="table table-sm table-striped mb-0">
                          <thead style={{ position: "sticky", top: 0, zIndex: 2, backgroundColor: "#1b2245" }}>
                            <tr>
                              <th style={{ backgroundColor: "#1b2245", color: "#ffffff", padding: "8px 12px", borderTop: "none" }}>Box #</th>
                              <th style={{ backgroundColor: "#1b2245", color: "#ffffff", padding: "8px 12px", borderTop: "none" }}>Barcode String</th>
                              <th style={{ backgroundColor: "#1b2245", color: "#ffffff", padding: "8px 12px", borderTop: "none" }}>Status</th>
                              <th style={{ backgroundColor: "#1b2245", color: "#ffffff", padding: "8px 12px", borderTop: "none" }}>Condition</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trackingData.all_boxes_in_consignment?.map((b, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
                                  <span className="badge bg-dark text-white">Box {b.box_number}</span>
                                </td>
                                <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
                                  <span className="font-monospace fw-semibold" style={{ color: "#1b2245" }}>
                                    {b.barcode_string}
                                  </span>
                                </td>
                                <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
                                  <span className="badge bg-light text-dark border">{b.current_status || "Active"}</span>
                                </td>
                                <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
                                  {b.is_damaged ? (
                                    <span className="badge bg-danger text-white">Damaged</span>
                                  ) : (
                                    <span className="badge bg-success text-white">Intact</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Damaged Box Photos Gallery */}
                    {trackingData.attachments && trackingData.attachments.length > 0 && (
                      <div className="border rounded bg-white p-3 shadow-sm">
                        <h6 className="fw-bold border-bottom pb-2 mb-3 text-danger">
                          <FiImage className="me-1" /> Damaged Box Photos ({trackingData.attachments.length})
                        </h6>
                        <div className="row g-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
                          {trackingData.attachments.map((att, idx) => {
                            const fullUrl = att.file_url?.startsWith("http")
                              ? att.file_url
                              : `${getAssetBaseUrl()}${att.file_url}`;

                            return (
                              <div key={idx} className="col-4">
                                <img
                                  src={fullUrl}
                                  alt={`Damage photo ${idx + 1}`}
                                  className="img-fluid rounded border"
                                  style={{ height: "90px", width: "100%", objectFit: "cover", cursor: "pointer" }}
                                  onClick={() => setSelectedPhoto(fullUrl)}
                                  title="Click to view"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/150x110?text=Damage+Photo";
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <p>Enter a box barcode or order number above to view timeline tracking</p>
              </div>
            )}
          </>
        )}

        {/* --------------------------------------------------------------------------------- */}
        {/* TAB 4: CONTAINER BATCH RECONCILIATION & MISSING CARTONS REPORT                     */}
        {/* --------------------------------------------------------------------------------- */}
        {activeTab === "reconciliation" && (
          <>
            {/* Batch Selector Bar in Asia Direct Style */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 my-3">
              <div style={{ minWidth: "280px" }}>
                <select
                  className="form-control"
                  style={{ height: "38px", fontSize: "13px" }}
                  value={selectedBatchId}
                  onChange={(e) => {
                    const bId = e.target.value;
                    setSelectedBatchId(bId);
                    fetchBatchReconciliation(bId);
                  }}
                  disabled={batchesLoading}
                >
                  <option value="">-- Select Container Batch --</option>
                  {batchesList.map((b) => (
                    <option key={b.batch_id} value={b.batch_id}>
                      {b.batch_number} {b.vessel ? `• Vessel: ${b.vessel}` : ""} ({b.destination_country_name || "Destination"})
                    </option>
                  ))}
                </select>
              </div>

              {reconciliationData && (
                <button
                  type="button"
                  className="blueBtn btn_batch d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: "#1b2245",
                    color: "#ffffff",
                    border: "1px solid #1b2245",
                    padding: "7px 16px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                  onClick={handlePrintAuditReport}
                >
                  <FiPrinter style={{ fontSize: "15px", color: "#ffffff" }} />
                  <span style={{ color: "#ffffff" }}>Print Audit Report</span>
                </button>
              )}
            </div>

            {/* Reconciliation Data Body */}
            {reconciliationLoading ? (
              <div className="loader-container" style={{ height: "40vh", background: "transparent" }}>
                <div className="loader"></div>
                <p className="loader-text">Reconciling container batch cartons...</p>
              </div>
            ) : reconciliationData ? (
              <div ref={auditPrintAreaRef} className="mt-3">
                {/* Summary Metric Strip */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="p-3 bg-white rounded border shadow-sm text-center">
                      <small className="text-muted d-block">Batch Number</small>
                      <h6 className="fw-bold mb-0" style={{ color: "#1b2245" }}>{reconciliationData.batch?.batch_number || "N/A"}</h6>
                      <small className="text-muted">{reconciliationData.batch?.vessel || "Container Manifest"}</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-white rounded border shadow-sm text-center">
                      <small className="text-muted d-block">Total Assigned Cartons</small>
                      <h4 className="fw-bold text-dark mb-0">{reconciliationData.summary?.total_assigned_boxes || 0}</h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-white rounded border shadow-sm text-center border-success">
                      <small className="text-success d-block fw-semibold">Total Loaded</small>
                      <h4 className="fw-bold text-success mb-0">{reconciliationData.summary?.total_loaded || 0}</h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-white rounded border shadow-sm text-center border-danger">
                      <small className="text-danger d-block fw-semibold">Pending / Missing</small>
                      <h4 className="fw-bold text-danger mb-0">{reconciliationData.summary?.total_pending || 0}</h4>
                    </div>
                  </div>
                </div>

                {/* Carton Table */}
                <div
                  className="table-responsive"
                  style={{
                    maxHeight: "450px",
                    overflowY: "auto",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                  }}
                >
                  <table className="table table-striped tableICon mb-0">
                    <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      <tr>
                        <th style={{ backgroundColor: "#1b2245", color: "#ffffff" }}>Box #</th>
                        <th style={{ backgroundColor: "#1b2245", color: "#ffffff" }}>Barcode String</th>
                        <th style={{ backgroundColor: "#1b2245", color: "#ffffff" }}>Order Ref</th>
                        <th style={{ backgroundColor: "#1b2245", color: "#ffffff" }}>Weight</th>
                        <th style={{ backgroundColor: "#1b2245", color: "#ffffff" }}>Loading Status</th>
                        <th style={{ backgroundColor: "#1b2245", color: "#ffffff" }}>Condition</th>
                        <th className="text-end" style={{ backgroundColor: "#1b2245", color: "#ffffff" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconciliationData.boxes && reconciliationData.boxes.length > 0 ? (
                        reconciliationData.boxes.map((box, idx) => {
                          const isLoaded = box.status === "loaded";
                          return (
                            <tr key={box.id || idx}>
                              <td>
                                Box {box.box_number} of {box.total_boxes}
                              </td>
                              <td>
                                <span className="font-monospace fw-semibold" style={{ color: "#1b2245" }}>
                                  {box.barcode_string}
                                </span>
                              </td>
                              <td>
                                <span className="fw-medium text-dark">
                                  {box.order_number || box.warehouse_order_number || "N/A"}
                                </span>
                              </td>
                              <td>{box.weight_kg ? `${box.weight_kg} kg` : "—"}</td>
                              <td>
                                {isLoaded ? (
                                  <span className="badge bg-success text-white">✔ Loaded</span>
                                ) : (
                                  <span className="badge bg-danger text-white">✖ Pending</span>
                                )}
                              </td>
                              <td>
                                {box.is_damaged ? (
                                  <span className="badge bg-warning text-dark">⚠ Damaged</span>
                                ) : (
                                  <span className="badge bg-success text-white">✔ Intact</span>
                                )}
                              </td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link p-0 text-decoration-none"
                                  style={{ color: "#1b2245" }}
                                  onClick={() => handleOpenTrackingFromItem(box.barcode_string || box.order_number)}
                                >
                                  Audit ➔
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4 text-muted">
                            No cartons assigned or recorded for this container batch.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <p>Select a container batch above to view the reconciliation report</p>
              </div>
            )}
          </>
        )}

        {/* --------------------------------------------------------------------------------- */}
        {/* MODAL: Shipment Details & Associated Orders (GET /api/warehouse/shipments/:id)     */}
        {/* --------------------------------------------------------------------------------- */}
        {detailsModalOpen && selectedShipmentDetail && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "8px" }}>
                <div
                  className="modal-header px-4 py-3"
                  style={{
                    backgroundColor: "#1b2245",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="p-2 rounded d-flex align-items-center justify-content-center"
                      style={{ width: "38px", height: "38px", backgroundColor: "rgba(255, 255, 255, 0.15)", color: "#ffffff" }}
                    >
                      <FiTruck style={{ fontSize: "20px" }} />
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold text-white mb-0">
                        TMS Shipment: {selectedShipmentDetail.shipment_number || selectedShipmentDetail.waybill}
                      </h5>
                      <small className="text-white-50">
                        Waybill: {selectedShipmentDetail.waybill || "N/A"} | ID #{selectedShipmentDetail.shipment_id}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {renderBarcodeStatusBadge(selectedShipmentDetail.barcode_status)}
                    <button
                      type="button"
                      className="btn btn-sm ms-2 d-flex align-items-center justify-content-center"
                      onClick={() => setDetailsModalOpen(false)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.35)",
                        color: "#ffffff",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title="Close"
                      aria-label="Close"
                    >
                      <FiX style={{ fontSize: "18px", color: "#ffffff" }} />
                    </button>
                  </div>
                </div>

                <div className="modal-body p-4" style={{ maxHeight: "78vh", overflowY: "auto" }}>
                  {/* Shipment Info Cards Grid */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-3 col-sm-6">
                      <div className="p-3 bg-light rounded h-100 border">
                        <small className="text-muted d-block">Carrier & Vessel</small>
                        <span className="fw-semibold text-dark">{selectedShipmentDetail.carrier || "N/A"}</span>
                        <small className="d-block text-muted">{selectedShipmentDetail.vessel || ""}</small>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="p-3 bg-light rounded h-100 border">
                        <small className="text-muted d-block">Container & Seal</small>
                        <span className="fw-semibold text-dark">{selectedShipmentDetail.container || "N/A"}</span>
                        <small className="d-block text-muted">Seal: {selectedShipmentDetail.seal || "N/A"}</small>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="p-3 bg-light rounded h-100 border">
                        <small className="text-muted d-block">Origin Warehouse</small>
                        <span className="fw-semibold text-dark">{selectedShipmentDetail.origin_warehouse_name || "Warehouse"}</span>
                        <small className="d-block text-muted">{selectedShipmentDetail.origin_country_name || ""}</small>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="p-3 bg-light rounded h-100 border">
                        <small className="text-muted d-block">Destination</small>
                        <span className="fw-semibold text-dark">{selectedShipmentDetail.destination_country_name || "South Africa"}</span>
                        <small className="d-block text-muted">Status: {selectedShipmentDetail.status || "In Transit"}</small>
                      </div>
                    </div>
                  </div>

                  {/* Shipment Metrics Strip */}
                  <div className="row g-3 mb-4 p-3 border rounded bg-white shadow-sm">
                    <div className="col-md-3 text-center border-end">
                      <small className="text-muted d-block">Associated Orders</small>
                      <h4 className="fw-bold text-primary mb-0">{selectedShipmentDetail.total_orders || 0}</h4>
                    </div>
                    <div className="col-md-3 text-center border-end">
                      <small className="text-muted d-block">Total Boxes (Packages)</small>
                      <h4 className="fw-bold text-dark mb-0">{selectedShipmentDetail.total_boxes || 0}</h4>
                    </div>
                    <div className="col-md-3 text-center border-end">
                      <small className="text-muted d-block">Total Weight</small>
                      <h4 className="fw-bold text-dark mb-0">{selectedShipmentDetail.total_weight || 0} kg</h4>
                    </div>
                    <div className="col-md-3 text-center">
                      <small className="text-muted d-block">Total CBM</small>
                      <h4 className="fw-bold text-dark mb-0">{selectedShipmentDetail.total_cbm || 0} CBM</h4>
                    </div>
                  </div>

                  {/* Associated Orders Table Header & Quick Actions */}
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <div>
                      <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <FiPackage style={{ color: "#2563eb", fontSize: "18px" }} /> Associated Orders & Box Barcode Status
                      </h6>
                      <small className="text-muted">
                        Suggested Ref: <strong>{selectedShipmentDetail.suggested_warehouse_ref || "N/A"}</strong>
                      </small>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm d-inline-flex align-items-center gap-1 shadow-sm"
                        style={{
                          borderRadius: "6px",
                          fontWeight: "600",
                          fontSize: "12.5px",
                          backgroundColor: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleDownloadPdfLabels(
                            selectedShipmentDetail.suggested_warehouse_ref ||
                            selectedShipmentDetail.shipment_number
                          )
                        }
                        disabled={pdfLoading}
                        title="Print / Download 4x6 PDF Labels for this shipment"
                      >
                        {pdfLoading ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          <FiFileText style={{ color: "#1d4ed8" }} />
                        )}
                        <span style={{ color: "#1d4ed8" }}>4x6 PDF Labels</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm d-inline-flex align-items-center gap-1 shadow-sm"
                        style={{
                          borderRadius: "6px",
                          fontWeight: "600",
                          fontSize: "12.5px",
                          backgroundColor: "#f8fafc",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleFetchZplCode(
                            selectedShipmentDetail.suggested_warehouse_ref ||
                            selectedShipmentDetail.shipment_number
                          )
                        }
                        disabled={zplLoading}
                        title="Get Zebra Thermal ZPL Code for this shipment"
                      >
                        {zplLoading ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          <FiCode style={{ color: "#334155" }} />
                        )}
                        <span style={{ color: "#334155" }}>ZPL Code</span>
                      </button>
                    </div>
                  </div>

                  {/* Associated Orders Table */}
                  <div className="table-responsive border rounded">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Order #</th>
                          <th>Warehouse Ref</th>
                          <th>Supplier Order ID</th>
                          <th>Supplier Name</th>
                          <th>Boxes</th>
                          <th>Weight / CBM</th>
                          <th>Goods Description</th>
                          <th>Barcode Status</th>
                          <th className="text-end" style={{ minWidth: "210px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedShipmentDetail.associated_orders && selectedShipmentDetail.associated_orders.length > 0 ? (
                          selectedShipmentDetail.associated_orders.map((ord, idx) => {
                            const isGenerated =
                              String(ord.barcode_status || "").toUpperCase() === "GENERATED";
                            const refKey =
                              ord.order_number ||
                              (ord.warehouse_reference !== "N/A" ? ord.warehouse_reference : "") ||
                              `OR000${ord.order_id}`;

                            return (
                              <tr key={ord.order_id || idx}>
                                <td>
                                  <span
                                    className="badge bg-light text-dark border px-2 py-1"
                                    style={{ fontFamily: "monospace", fontSize: "13px" }}
                                  >
                                    {ord.order_number || `Order #${ord.order_id}`}
                                  </span>
                                </td>
                                <td>
                                  <span className="fw-medium text-secondary">
                                    {ord.warehouse_reference || "N/A"}
                                  </span>
                                </td>
                                <td>
                                  <span className="text-muted">
                                    {ord.supplier_warehouse_order_id
                                      ? `#${ord.supplier_warehouse_order_id}`
                                      : "N/A"}
                                  </span>
                                </td>
                                <td>
                                  <span className="text-dark">{ord.supplier_name || "N/A"}</span>
                                </td>
                                <td>
                                  <span className="badge bg-light text-dark border">
                                    {ord.packages || 0} Boxes
                                  </span>
                                </td>
                                <td>
                                  <small className="text-muted d-block">
                                    {ord.weight ? `${ord.weight} kg` : "—"}
                                  </small>
                                  <small className="text-muted">
                                    {ord.cbm ? `${ord.cbm} CBM` : "—"}
                                  </small>
                                </td>
                                <td>
                                  <span
                                    className="text-truncate d-inline-block fw-medium"
                                    style={{
                                      maxWidth: "180px",
                                      color:
                                        ord.goods_description ||
                                          ord.description ||
                                          ord.cargo_description ||
                                          ord.item_description
                                          ? "#0f172a"
                                          : "#64748b",
                                      fontSize: "12.5px",
                                    }}
                                    title={
                                      ord.goods_description ||
                                      ord.description ||
                                      ord.cargo_description ||
                                      ord.item_description ||
                                      "No description provided"
                                    }
                                  >
                                    {ord.goods_description ||
                                      ord.description ||
                                      ord.cargo_description ||
                                      ord.item_description ||
                                      "—"}
                                  </span>
                                </td>
                                <td>{renderBarcodeStatusBadge(ord.barcode_status)}</td>
                                <td className="text-end">
                                  <div className="d-flex justify-content-end align-items-center gap-2">
                                    {isGenerated ? (
                                      <>
                                        <button
                                          type="button"
                                          className="tms-action-view-btn shadow-sm"
                                          style={{
                                            backgroundColor: "#ecfdf5",
                                            background: "#ecfdf5",
                                            color: "#059669",
                                            border: "1px solid #10b981",
                                            padding: "5px 12px",
                                            borderRadius: "6px",
                                            fontWeight: "600",
                                            fontSize: "12px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            cursor: "pointer",
                                            lineHeight: "1.4",
                                          }}
                                          onClick={() => handleFetchReprintBarcodes(refKey)}
                                          disabled={loadingReprint}
                                          title="View & Print generated box barcode labels"
                                        >
                                          <FiEye style={{ fontSize: "14px", color: "#059669", stroke: "#059669" }} />
                                          <span style={{ color: "#059669", fontWeight: "600" }}>View Labels</span>
                                        </button>

                                        <button
                                          type="button"
                                          className="tms-action-regen-btn shadow-sm"
                                          style={{
                                            backgroundColor: "#fffbeb",
                                            background: "#fffbeb",
                                            color: "#b45309",
                                            border: "1px solid #f59e0b",
                                            padding: "5px 12px",
                                            borderRadius: "6px",
                                            fontWeight: "600",
                                            fontSize: "12px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            cursor: "pointer",
                                            lineHeight: "1.4",
                                          }}
                                          onClick={() =>
                                            handleOpenGenerateModal(ord, selectedShipmentDetail, true)
                                          }
                                          title="Regenerate barcodes for this order (sends overwrite: true)"
                                        >
                                          <FiRefreshCw style={{ fontSize: "13px", color: "#b45309", stroke: "#b45309" }} />
                                          <span style={{ color: "#b45309", fontWeight: "600" }}>Regenerate</span>
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        className="tms-action-gen-btn shadow-sm"
                                        style={{
                                          backgroundColor: "#2563eb",
                                          background: "#2563eb",
                                          color: "#ffffff",
                                          border: "1px solid #2563eb",
                                          padding: "5px 14px",
                                          borderRadius: "6px",
                                          fontWeight: "600",
                                          fontSize: "12px",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "5px",
                                          cursor: "pointer",
                                          lineHeight: "1.4",
                                        }}
                                        onClick={() =>
                                          handleOpenGenerateModal(ord, selectedShipmentDetail, false)
                                        }
                                        title="Generate new box barcodes for this order"
                                      >
                                        <FiBox style={{ fontSize: "13px", color: "#ffffff", stroke: "#ffffff" }} />
                                        <span style={{ color: "#ffffff", fontWeight: "600" }}>Generate Barcodes</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="9" className="text-center py-4 text-muted">
                              No associated orders found for this shipment.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  className="modal-footer border-0 bg-light px-4 py-3"
                  style={{ borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}
                >
                  <button
                    type="button"
                    className="btn btn-danger px-4 fw-semibold"
                    style={{ borderRadius: "6px" }}
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------------------- */}
        {/* MODAL: Barcode Generation / Regeneration (POST /api/warehouse/barcodes/generate)  */}
        {/* --------------------------------------------------------------------------------- */}
        {generateModalOpen && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "8px" }}>
                <div
                  className="modal-header px-4 py-3"
                  style={{
                    backgroundColor: "#1b2245",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                >
                  <h5 className="modal-title fw-bold text-white mb-0 d-flex align-items-center gap-2">
                    {generateForm.is_regenerate ? (
                      <>
                        <FiRefreshCw style={{ color: "#fbbf24", fontSize: "20px" }} /> Regenerate Box Barcodes
                      </>
                    ) : (
                      <>
                        <FiBox style={{ color: "#60a5fa", fontSize: "20px" }} /> Generate Box Barcodes
                      </>
                    )}
                  </h5>
                  <button
                    type="button"
                    className="btn btn-sm d-flex align-items-center justify-content-center"
                    onClick={() => setGenerateModalOpen(false)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.35)",
                      color: "#ffffff",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    title="Close"
                    aria-label="Close"
                  >
                    <FiX style={{ fontSize: "18px", color: "#ffffff" }} />
                  </button>
                </div>
                <form onSubmit={handleGenerateBarcodesSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-secondary" style={{ fontSize: "13px" }}>
                        TMS Shipment Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={generateForm.shipment_number}
                        onChange={(e) =>
                          setGenerateForm({ ...generateForm, shipment_number: e.target.value })
                        }
                        placeholder="e.g. COSU6502789860"
                        required
                      />
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: "13px" }}>
                          Order Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={generateForm.order_number}
                          onChange={(e) =>
                            setGenerateForm({ ...generateForm, order_number: e.target.value })
                          }
                          placeholder="e.g. OR0001125"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: "13px" }}>
                          Warehouse Reference
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={generateForm.warehouse_reference}
                          onChange={(e) =>
                            setGenerateForm({ ...generateForm, warehouse_reference: e.target.value })
                          }
                          placeholder="e.g. 1338"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold text-dark" style={{ fontSize: "14px" }}>
                        Total Number of Boxes <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        className="form-control form-control-lg border-primary"
                        value={generateForm.total_boxes}
                        onChange={(e) =>
                          setGenerateForm({
                            ...generateForm,
                            total_boxes: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        required
                      />
                      <small className="text-muted">
                        Each box will receive a unique printable Code128 and QR barcode label.
                      </small>
                    </div>

                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: "13px" }}>
                          Weight (kg) (Optional)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control"
                          value={generateForm.weight_kg}
                          onChange={(e) =>
                            setGenerateForm({ ...generateForm, weight_kg: e.target.value })
                          }
                          placeholder="e.g. 150"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: "13px" }}>
                          CBM (Optional)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={generateForm.cbm}
                          onChange={(e) => setGenerateForm({ ...generateForm, cbm: e.target.value })}
                          placeholder="e.g. 1.25"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 bg-light px-4 py-3">
                    <button
                      type="button"
                      className="btn btn-secondary px-3"
                      onClick={() => setGenerateModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`btn ${generateForm.is_regenerate
                          ? "btn-warning text-dark fw-bold"
                          : "btn-primary fw-semibold"
                        } px-4 shadow-sm`}
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {generateForm.is_regenerate ? "Regenerating..." : "Generating..."}
                        </>
                      ) : generateForm.is_regenerate ? (
                        "Regenerate Barcodes"
                      ) : (
                        "Generate Barcodes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------------------- */}
        {/* MODAL: Generated / Reprint Barcodes View (4x6 PDF / ZPL / Print Labels)            */}
        {/* --------------------------------------------------------------------------------- */}
        {barcodePrintModalOpen && generatedBarcodeResult && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "8px" }}>
                <div
                  className="modal-header px-4 py-3 text-white"
                  style={{
                    backgroundColor: "#1b2245",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded bg-success text-white d-flex align-items-center justify-content-center">
                      <FiCheckCircle style={{ fontSize: "20px" }} />
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold text-white mb-0">
                        Box Barcode Labels ({generatedBarcodeResult.boxes?.length || 0} Boxes)
                      </h5>
                      <small className="text-white-50">
                        Order: <strong>{generatedBarcodeResult.order_number || "N/A"}</strong> | Ref: <strong>{generatedBarcodeResult.warehouse_reference || "N/A"}</strong>
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <button
                      className="btn btn-sm btn-light text-primary fw-semibold d-flex align-items-center gap-1 shadow-sm"
                      onClick={() =>
                        handleDownloadPdfLabels(
                          generatedBarcodeResult.order_number ||
                          generatedBarcodeResult.warehouse_reference
                        )
                      }
                      disabled={pdfLoading}
                      title="Download or Print 4x6 inch PDF Labels"
                    >
                      {pdfLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <FiDownload style={{ fontSize: "14px" }} />
                      )}
                      <span>4x6 PDF</span>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 shadow-sm"
                      onClick={() =>
                        handleFetchZplCode(
                          generatedBarcodeResult.order_number ||
                          generatedBarcodeResult.warehouse_reference
                        )
                      }
                      disabled={zplLoading}
                      title="Get Zebra Thermal ZPL Code"
                    >
                      {zplLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <FiCode style={{ fontSize: "14px" }} />
                      )}
                      <span>Zebra ZPL</span>
                    </button>

                    <button
                      className="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
                      onClick={handlePrintLabels}
                      title="Browser Label Print"
                    >
                      <FiPrinter style={{ fontSize: "14px" }} />
                      <span>Print All Labels</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm ms-2 d-flex align-items-center justify-content-center"
                      onClick={() => setBarcodePrintModalOpen(false)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.35)",
                        color: "#ffffff",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title="Close"
                      aria-label="Close"
                    >
                      <FiX style={{ fontSize: "18px", color: "#ffffff" }} />
                    </button>
                  </div>
                </div>

                <div className="modal-body p-4" style={{ maxHeight: "75vh", overflowY: "auto", background: "#f8fafc" }}>
                  {/* Printable Labels Area */}
                  <div ref={printAreaRef}>
                    <div className="row g-4 justify-content-center">
                      {generatedBarcodeResult.boxes && generatedBarcodeResult.boxes.length > 0 ? (
                        generatedBarcodeResult.boxes.map((box, idx) => (
                          <div key={idx} className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                            <div
                              className="barcode-card card h-100 shadow-sm border-2 border-dark"
                              style={{
                                borderRadius: "10px",
                                padding: "16px",
                                background: "#fff",
                                maxWidth: "380px",
                                margin: "0 auto",
                              }}
                            >
                              {/* Header & Box Badge */}
                              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                <div>
                                  <div className="company-hd" style={{ fontSize: "13px", fontWeight: "800", color: "#1e3a8a", letterSpacing: "0.5px" }}>
                                    ASIA DIRECT LOGISTICS
                                  </div>
                                  <small className="sub-hd" style={{ fontSize: "10px", color: "#64748b", display: "block" }}>
                                    Warehouse Tracking Label
                                  </small>
                                </div>
                                <span className="badge-box bg-dark text-white fw-bold px-2 py-1 rounded" style={{ fontSize: "12px" }}>
                                  BOX {box.box_number} OF {box.total_boxes}
                                </span>
                              </div>

                              {/* Perfectly Fitted Barcode Container */}
                              <div
                                className="barcode-svg-container my-2 py-2 px-1 bg-light rounded text-center"
                                style={{
                                  width: "100%",
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  boxSizing: "border-box",
                                }}
                              >
                                <Barcode
                                  value={box.barcode_string}
                                  width={1.05}
                                  height={46}
                                  fontSize={11}
                                  margin={0}
                                  displayValue={true}
                                />
                              </div>

                              {/* Details Table */}
                              <table className="info-table table table-sm table-borderless mb-0" style={{ fontSize: "11px" }}>
                                <tbody>
                                  <tr className="border-bottom">
                                    <td className="lbl fw-bold text-secondary" style={{ width: "40%" }}>Order Number:</td>
                                    <td className="fw-bold text-dark">{box.order_number || generatedBarcodeResult.order_number || "N/A"}</td>
                                  </tr>
                                  <tr className="border-bottom">
                                    <td className="lbl fw-bold text-secondary">Warehouse Ref:</td>
                                    <td className="fw-semibold">{box.warehouse_order_number || generatedBarcodeResult.warehouse_reference || "N/A"}</td>
                                  </tr>
                                  <tr className="border-bottom">
                                    <td className="lbl fw-bold text-secondary">Origin Store:</td>
                                    <td>{box.origin_name || generatedBarcodeResult.origin_warehouse || "AD - Warehouse"}</td>
                                  </tr>
                                  <tr className="border-bottom">
                                    <td className="lbl fw-bold text-secondary">Destination:</td>
                                    <td className="fw-semibold text-primary">{box.destination_name || generatedBarcodeResult.destination_warehouse || "South Africa"}</td>
                                  </tr>
                                  {box.qr_code_data && (
                                    <tr>
                                      <td colSpan="2" className="pt-2">
                                        <div
                                          className="p-1 bg-light rounded text-muted"
                                          style={{
                                            fontSize: "9.5px",
                                            wordBreak: "break-all",
                                            fontFamily: "monospace",
                                            lineHeight: "1.3",
                                          }}
                                        >
                                          QR: {box.qr_code_data}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-12 text-center py-4 text-muted">
                          No box barcode records generated.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 bg-light px-4 py-3 d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    Showing {generatedBarcodeResult.boxes?.length || 0} box barcode label(s)
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setBarcodePrintModalOpen(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm d-inline-flex align-items-center gap-1 shadow-sm px-3 py-2"
                      style={{
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "13px",
                        backgroundColor: "#eff6ff",
                        color: "#1d4ed8",
                        border: "1px solid #bfdbfe",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleDownloadPdfLabels(
                          generatedBarcodeResult.order_number ||
                          generatedBarcodeResult.warehouse_reference
                        )
                      }
                      disabled={pdfLoading}
                    >
                      <FiDownload style={{ color: "#1d4ed8" }} />
                      <span style={{ color: "#1d4ed8" }}>4x6 PDF</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm d-inline-flex align-items-center gap-2 shadow-sm px-3 py-2"
                      style={{
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "13px",
                        backgroundColor: "#1b2245",
                        color: "#ffffff",
                        border: "1px solid #1b2245",
                        cursor: "pointer",
                      }}
                      onClick={handlePrintLabels}
                    >
                      <FiPrinter style={{ fontSize: "16px", color: "#ffffff" }} />
                      <span style={{ color: "#ffffff" }}>Print Labels</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------------------- */}
        {/* MODAL: Zebra Thermal Print Code (ZPL) (GET /api/warehouse/labels/zpl)             */}
        {/* --------------------------------------------------------------------------------- */}
        {zplModalOpen && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "8px" }}>
                <div
                  className="modal-header px-4 py-3 text-white"
                  style={{
                    backgroundColor: "#1b2245",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="p-2 rounded d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", color: "#ffffff" }}
                    >
                      <FiCode style={{ fontSize: "18px" }} />
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold text-white mb-0">Zebra Thermal Print Code (ZPL)</h5>
                      <small className="text-white-50">Direct output for Zebra Thermal Barcode Label Printers</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm d-flex align-items-center justify-content-center"
                    onClick={() => setZplModalOpen(false)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.35)",
                      color: "#ffffff",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    title="Close"
                    aria-label="Close"
                  >
                    <FiX style={{ fontSize: "18px", color: "#ffffff" }} />
                  </button>
                </div>
                <div className="modal-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold text-secondary small">Raw ZPL Code:</span>
                    <button
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                      onClick={() => copyText(zplCode)}
                    >
                      <FiCopy fontSize="small" /> Copy ZPL
                    </button>
                  </div>
                  <textarea
                    className="form-control font-monospace p-3 bg-dark text-light"
                    rows={12}
                    value={zplCode}
                    readOnly
                    style={{ fontSize: "12px", borderRadius: "8px" }}
                  />
                </div>
                <div className="modal-footer border-0 bg-light px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setZplModalOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleDownloadZplFile}
                  >
                    <FiDownload /> Download .zpl File
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------------------- */}
        {/* LIGHTBOX MODAL: Damaged Box Photo Zoom Preview                                    */}
        {/* --------------------------------------------------------------------------------- */}
        {selectedPhoto && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", zIndex: 1060 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg bg-dark text-white" style={{ borderRadius: "12px" }}>
                <div className="modal-header border-0 pb-0">
                  <h6 className="modal-title text-white-50">Damage Inspection Photo</h6>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedPhoto(null)}
                  ></button>
                </div>
                <div className="modal-body p-3 text-center">
                  <img
                    src={selectedPhoto}
                    alt="Enlarged Damage Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: "75vh", objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
