import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FaEdit } from "react-icons/fa";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from './Assests/logo.png';

const ManageCollectionDelivery = () => {
    const navigate = useNavigate();
    const [collection, setCollection] = useState([]);
    const [delivery, setDelivery] = useState([]);
    const [activeTab, setActiveTab] = useState("collection");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagenationData, setPagenationData] = useState({});
    const [limit, setLimit] = useState("");
    const [loader, setLoader] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ item: null, type: "", status: "" });
    const [supplierList, setSupplierList] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");

    // Tasks modal states
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [taskModalItem, setTaskModalItem] = useState(null);
    const [taskSelectedSupplier, setTaskSelectedSupplier] = useState("");

    // Collection completion states
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [completeModalItem, setCompleteModalItem] = useState(null);
    const [completeAction, setCompleteAction] = useState("");
    const [waybillList, setWaybillList] = useState([]);
    const [selectedShipmentId, setSelectedShipmentId] = useState("");
    const [completeLoader, setCompleteLoader] = useState(false);

    // Edit collection/delivery states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        collection_delivery_id: "",
        freight_id: "",
        order_id: "",
        supplier_name: "",
        supplier_contact_person: "",
        supplier_contact: "",
        pickup_address: "",
        customer_ref: "",
        create_new_warehouse_order: "No",
        warehouse_order_id: "",
        date_picked_up: "",
        courier_waybill_ref: "",
        box_marking: "",
        goods_description: "",
        package_type: "",
        hazardous: "No",
        hazardous_description: "",
        total_packages: "",
        total_cbm: "",
        total_weight: "",
        package_comments: "",
        costs_to_collect: "",
        handling_cost: "",
        warehouse_cost: "",
        warehouse_comment: ""
    });
    const [files, setFiles] = useState({
        box_marking_attachment: null,
        goods_description_attachment: null,
        product_pictures: null,
        other_attachments: null
    });

    const [existingAttachments, setExistingAttachments] = useState({
        box_marking_attachment: [],
        goods_description_attachment: [],
        product_pictures: [],
        other_attachments: []
    });

    // View details states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewDetails, setViewDetails] = useState(null);

    const getDocUrl = (filename) => {
        if (!filename) return "";
        const baseUrl = process.env.REACT_APP_BASE_URL || "";
        if (baseUrl.includes("/api/")) {
            return baseUrl.replace("/api/", "/documents/") + filename;
        }
        return (process.env.REACT_APP_BASE_URLdocument || "https://sisccltd.com/documents/") + filename;
    };

    const getImageUrl = (filename) => {
        if (!filename) return "";
        const baseUrl = process.env.REACT_APP_BASE_URL || "";
        if (baseUrl.includes("/api/")) {
            return baseUrl.replace("/api/", "/images/") + filename;
        }
        return (process.env.REACT_APP_BASE_URL_image || "https://sisccltd.com/images/") + filename;
    };

    const renderAttachment = (file) => {
        if (!file) return null;
        const lower = file.toLowerCase();
        const isImg = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp');
        const fileUrl = `${process.env.REACT_APP_BASE_URLdocument}${file}`;
        if (isImg) {
            return (
                <img
                    src={fileUrl}
                    alt={file}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', cursor: 'pointer', borderRadius: '6px', border: '1px solid #dee2e6' }}
                    onClick={() => window.open(fileUrl, '_blank')}
                    title="Click to view full image"
                />
            );
        }
        return (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="d-inline-flex align-items-center p-2 border rounded text-decoration-none bg-white text-dark small" style={{ width: '100px', height: '100px', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="fw-semibold text-danger text-uppercase mb-1">{lower.split('.').pop()}</span>
                <span className="text-truncate text-center w-100" style={{ fontSize: '10px' }}>{file}</span>
            </a>
        );
    };

    const userid = JSON.parse(localStorage.getItem("data123"))?.id;
    const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;

    const FetchCollectDeliveryList = async (page = 1, search = "") => {
        try {
            setLoader(true);
            const payload = {
                user_id: userid,
                user_type: usertype,
                search: search,
                page: page
            };
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}GetReadyFreightAdmin`, payload
            );
            console.log(response.data);
            setCollection(response.data.collection || []);
            setDelivery(response.data.delivery || []);
            setLimit(response.data.limit);
            setPagenationData({
                total: response.data.total,
                collectionTotal: response.data.collectionTotal,
                deliveryTotal: response.data.deliveryTotal,
                page: response.data.page,
                limit: response.data.limit
            });
        } catch (error) {
            console.error("error");
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        FetchCollectDeliveryList(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL}supplier-list`);
                if (res.data.success) {
                    setSupplierList(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching suppliers", err);
            }
        };
        fetchSuppliers();
    }, []);

    const handleStatusChange = (item, type, e) => {
        const newStatus = e.target.value;
        if (newStatus === "Assigned") {
            setModalData({ item, type, status: newStatus });
            setModalOpen(true);
            setSelectedSupplier("");
        } else if (newStatus === "Complete" && type === "collection") {
            setCompleteModalItem(item);
            setCompleteAction("");
            setSelectedShipmentId("");
            setWaybillList([]);
            setCompleteModalOpen(true);
        } else {
            const existingSupplierId = type === "collection" ? item.collection_supplier_id : item.delivery_supplier_id;
            updateStatus(item.freight_id, type, newStatus, existingSupplierId || "");
        }
    };

    const updateStatus = async (freight_id, type, status, supplier_id) => {
        try {
            setLoader(true);
            const payload = {
                freight_id: String(freight_id),
                type: type,
                status: status,
                supplier_id: String(supplier_id),
                user_id: String(userid)
            };
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}ManageFreightStatus`, payload);
            toast.success(response.data?.message || "Status updated successfully");
            FetchCollectDeliveryList(currentPage, searchQuery);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoader(false);
            setModalOpen(false);
        }
    };

    const handleActionChange = async (action) => {
        setCompleteAction(action);
        if (action === "shipment") {
            try {
                setCompleteLoader(true);
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL}getWaybillDropdown`);
                if (res.data.success) {
                    setWaybillList(res.data.data || []);
                } else {
                    toast.error(res.data.message || "Failed to fetch waybills");
                }
            } catch (err) {
                console.error("Error fetching waybills:", err);
                toast.error("Error fetching waybills");
            } finally {
                setCompleteLoader(false);
            }
        }
    };

    const submitCollectionCompletion = async () => {
        if (!completeModalItem) return;
        try {
            setLoader(true);
            const payload = {
                freight_id: Number(completeModalItem.freight_id),
                action: completeAction
            };
            if (completeAction === "shipment") {
                payload.shipment_id = Number(selectedShipmentId);
            }

            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}confirmCollectionCompletion`, payload);
            toast.success(response.data?.message || "Collection completed successfully");
            setCompleteModalOpen(false);
            FetchCollectDeliveryList(currentPage, searchQuery);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoader(false);
        }
    };

    const handleTasksClick = (item) => {
        setTaskModalItem(item);
        setTaskSelectedSupplier("");
        setTaskModalOpen(true);
    };

    const assignSupplierForTask = async () => {
        if (!taskModalItem) return;
        if (!taskSelectedSupplier) {
            toast.error("Please select a supplier");
            return;
        }
        try {
            setLoader(true);
            let colDelId = taskModalItem.collection_delivery_id || taskModalItem.id;
            if (!colDelId) {
                const payload = {
                    freight_id: String(taskModalItem.freight_id || taskModalItem.freight_ID),
                    order_id: String(taskModalItem.order_id)
                };
                const res = await axios.post(`${process.env.REACT_APP_BASE_URL}GetCollectionDeliveryDetails`, payload);
                if (res.data.success && res.data.data) {
                    if (res.data.data.collection_delivery_details && res.data.data.collection_delivery_details.collection_delivery_id) {
                        colDelId = res.data.data.collection_delivery_details.collection_delivery_id;
                    } else if (res.data.data.id) {
                        colDelId = res.data.data.id;
                    }
                }
                if (!colDelId) {
                    const fallbackRes = await axios.post(`${process.env.REACT_APP_BASE_URL}GetCollectionDelivery`, payload);
                    if (fallbackRes.data.success && fallbackRes.data.data) {
                        colDelId = fallbackRes.data.data.id;
                    }
                }
            }

            if (!colDelId) {
                toast.error("Collection delivery details not found. Please edit the details first to save.");
                return;
            }

            const payload = {
                collection_delivery_id: Number(colDelId),
                order_id: Number(taskModalItem.order_id),
                freight_id: Number(taskModalItem.freight_id || taskModalItem.freight_ID),
                supplier_id: Number(taskSelectedSupplier)
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}assignCollectionDeliveryToSupplier`,
                payload
            );
            if (response.data.success) {
                toast.success(response.data?.message || "Supplier assigned successfully");
                setTaskModalOpen(false);
                FetchCollectDeliveryList(currentPage, searchQuery);
            } else {
                toast.error(response.data?.message || "Failed to assign supplier");
            }
        } catch (error) {
            console.error("Error in assignSupplierForTask:", error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoader(false);
        }
    };

    const handleEditClick = async (item) => {
        console.log("handleEditClick called with item:", item);
        if (!item) {
            console.error("Item is undefined or null");
            return;
        }

        const initialFormValues = {
            collection_delivery_id: "",
            freight_id: item.freight_id || item.freight_ID || "",
            order_id: item.order_id || "",
            supplier_name: item.collection_supplier_name || item.delivery_supplier_name || item.supplier_company || item.supplier_name || "",
            supplier_contact_person: item.supplier_person || item.supplier_contact_person || "",
            supplier_contact: item.supplier_contact_no || item.supplier_contact || "",
            pickup_address: item.supplier_address || item.pickup_address || "",
            customer_ref: item.customer_ref || "",
            create_new_warehouse_order: item.create_new_warehouse_order || "No",
            warehouse_order_id: item.warehouse_order_id || "",
            date_picked_up: item.date_picked_up || "",
            courier_waybill_ref: item.courier_waybill_ref || "",
            box_marking: item.box_marking || "",
            goods_description: item.goods_description || "",
            package_type: item.package_type || "",
            hazardous: item.hazardous || "No",
            hazardous_description: item.hazard_description || item.hazardous_description || "",
            total_packages: item.total_packages || item.total_packeges || "",
            total_cbm: item.total_cbm || item.CBM || "",
            total_weight: item.total_weight || item.weight || "",
            package_comments: item.package_comments || item.package_comment || "",
            costs_to_collect: item.costs_to_collect || "",
            handling_cost: item.handling_cost || "",
            warehouse_cost: item.warehouse_cost || "",
            warehouse_comment: item.warehouse_comment || ""
        };

        try {
            setLoader(true);
            const payload = {
                freight_id: String(item.freight_id || item.freight_ID),
                order_id: String(item.order_id)
            };
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}GetCollectionDelivery`, payload);
            console.log("GetCollectionDelivery response:", response.data);

            if (response.data.success && response.data.data) {
                const apiData = response.data.data;
                let formattedDate = "";
                if (apiData.date_picked_up) {
                    const dateObj = new Date(apiData.date_picked_up);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toISOString().split('T')[0];
                    }
                }

                setEditForm({
                    collection_delivery_id: apiData.id || "",
                    freight_id: apiData.freight_id || "",
                    order_id: apiData.order_id || "",
                    supplier_name: apiData.supplier_name || "",
                    supplier_contact_person: apiData.supplier_contact_person || "",
                    supplier_contact: apiData.supplier_contact || "",
                    pickup_address: apiData.pickup_address || "",
                    customer_ref: apiData.customer_ref || "",
                    create_new_warehouse_order: apiData.create_new_warehouse_order || "No",
                    warehouse_order_id: apiData.warehouse_order_id || "",
                    date_picked_up: formattedDate,
                    courier_waybill_ref: apiData.courier_waybill_ref || "",
                    box_marking: apiData.box_marking || "",
                    goods_description: apiData.goods_description || "",
                    package_type: apiData.package_type || "",
                    hazardous: apiData.hazardous || "No",
                    hazardous_description: apiData.hazardous_description || "",
                    total_packages: apiData.total_packages || "",
                    total_cbm: apiData.total_cbm || "",
                    total_weight: apiData.total_weight || "",
                    package_comments: apiData.package_comments || "",
                    costs_to_collect: apiData.costs_to_collect || "",
                    handling_cost: apiData.handling_cost || "",
                    warehouse_cost: apiData.warehouse_cost || "",
                    warehouse_comment: apiData.warehouse_comment || ""
                });

                setExistingAttachments({
                    box_marking_attachment: apiData.box_marking_attachment || [],
                    goods_description_attachment: apiData.goods_description_attachment || [],
                    product_pictures: apiData.product_pictures || [],
                    other_attachments: apiData.other_attachments || []
                });
            } else {
                console.log("No existing data from API; setting initial item form values.");
                setEditForm(initialFormValues);
                setExistingAttachments({
                    box_marking_attachment: [],
                    goods_description_attachment: [],
                    product_pictures: [],
                    other_attachments: []
                });
            }
        } catch (error) {
            console.error("Error fetching detailed collection delivery:", error);
            setEditForm(initialFormValues);
            setExistingAttachments({
                box_marking_attachment: [],
                goods_description_attachment: [],
                product_pictures: [],
                other_attachments: []
            });
        } finally {
            setLoader(false);
            setEditModalOpen(true);
        }

        setFiles({
            box_marking_attachment: null,
            goods_description_attachment: null,
            product_pictures: null,
            other_attachments: null
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, key) => {
        setFiles(prev => ({
            ...prev,
            [key]: e.target.files[0]
        }));
    };

    const submitEditForm = async () => {
        try {
            setLoader(true);
            const formData = new FormData();
            Object.keys(editForm).forEach(key => {
                if (key === 'collection_delivery_id') {
                    if (editForm[key]) {
                        formData.append(key, editForm[key]);
                    }
                } else {
                    formData.append(key, editForm[key]);
                }
            });
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    formData.append(key, files[key]);
                }
            });

            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}addUpdateCollectionDelivery`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success(response.data.message || "Updated successfully");
                setEditModalOpen(false);
                FetchCollectDeliveryList(currentPage, searchQuery);
            } else {
                toast.error(response.data.message || "Failed to update");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoader(false);
        }
    };

    const handleViewClick = async (item) => {
        console.log("handleViewClick called with item:", item);
        if (!item) return;
        try {
            setLoader(true);
            const payload = {
                freight_id: String(item.freight_id || item.freight_ID),
                order_id: String(item.order_id)
            };
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}GetCollectionDeliveryDetails`, payload);
            console.log("GetCollectionDeliveryDetails response:", response.data);
            if (response.data.success && response.data.data) {
                setViewDetails(response.data.data);
                setViewModalOpen(true);
            } else {
                toast.error(response.data.message || "Failed to fetch details");
            }
        } catch (error) {
            console.error("Error fetching view details:", error);
            toast.error(error.response?.data?.message || "Error fetching details from API");
        } finally {
            setLoader(false);
        }
    };

    const handlePdfPrint = async (item) => {
        try {
            setLoader(true);
            const payload = {
                freight_id: item.freight_id || item.freight_ID
            };
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}qouteEstimateDetailsByFreight`, payload);
            if (!response.data.success || !response.data.data) {
                toast.error(response.data?.message || "Failed to fetch estimate details");
                return;
            }

            const freight = response.data.data;

            // Helper functions for PDF drawing
            const loadImageAsDataUrl = async (url) => {
                try {
                    const res = await fetch(url);
                    const blob = await res.blob();
                    return await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = () => resolve(null);
                        reader.readAsDataURL(blob);
                    });
                } catch (err) {
                    console.error("Could not load logo for PDF:", err);
                    return null;
                }
            };

            const cleanParseFloat = (val) => {
                if (val === null || val === undefined || val === "") return 0;
                const cleaned = String(val).replace(/,/g, '').replace(/%/g, '').trim();
                const parsed = parseFloat(cleaned);
                return isNaN(parsed) ? 0 : parsed;
            };

            const formatValue = (val, dec = 2, isPercent = false) => {
                if (val === null || val === undefined || val === "") {
                    return isPercent ? "0.00 %" : "0.00";
                }
                const cleanVal = String(val).replace(/,/g, '').replace(/%/g, '').trim();
                const num = parseFloat(cleanVal);
                if (isNaN(num)) {
                    return val;
                }
                const formatted = num.toLocaleString("en-US", {
                    minimumFractionDigits: dec,
                    maximumFractionDigits: dec
                });
                return isPercent ? `${formatted} %` : formatted;
            };

            const getVatPercent = (vatTyp) => {
                if (!vatTyp) return 0;
                if (!isNaN(vatTyp) && !isNaN(parseFloat(vatTyp))) {
                    return parseFloat(vatTyp);
                }
                const match = String(vatTyp).match(/(\d+(?:\.\d+)?)\s*%/);
                if (match) {
                    return parseFloat(match[1]);
                }
                return 0;
            };

            const drawLabelValueRow = (doc, x, y, width, label, value) => {
                doc.setFontSize(8.5);
                doc.setTextColor(20, 20, 20);
                const valStr = String(value ?? "");
                const labelStr = String(label ?? "");
                doc.setFont("helvetica", "normal");
                const valW = valStr ? doc.getTextWidth(valStr) : 0;
                const maxLabelW = width - valW - 3;
                doc.setFont("helvetica", "bold");
                const truncated = doc.splitTextToSize(labelStr, maxLabelW > 0 ? maxLabelW : width)[0] ?? "";
                doc.text(truncated, x, y);
                doc.setFont("helvetica", "normal");
                if (valStr) doc.text(valStr, x + width, y, { align: "right" });
            };

            const drawSectionBar = (doc, x, y, width, height, text) => {
                doc.setFillColor(27, 34, 69);
                doc.rect(x, y, width, height, "F");
                doc.setTextColor(255, 255, 255);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.text(text, x + width / 2, y + height / 2 + 1.2, { align: "center" });
                doc.setTextColor(20, 20, 20);
            };

            // Start PDF generation
            const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
            const pageWidth = doc.internal.pageSize.getWidth();   // 297 mm
            const pageHeight = doc.internal.pageSize.getHeight();  // 210 mm
            const margin = 10;
            const contentWidth = pageWidth - margin * 2;
            const colSplitX = margin + contentWidth / 2;

            let cursorY = margin;

            // Load Logo
            const logoDataUrl = await loadImageAsDataUrl(logo);
            if (logoDataUrl) {
                try {
                    const imgFmt = (logoDataUrl.split(";")[0].split("/")[1] || "PNG").toUpperCase();
                    doc.addImage(logoDataUrl, imgFmt, margin, cursorY, 38, 17);
                } catch (err) {
                    console.error("Could not embed logo:", err);
                }
            }

            // Company Info
            const companyX = margin + 150;
            const addr = freight.company_address;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(20, 20, 20);
            doc.text("Asia Direct - Africa", companyX, cursorY + 5);
            doc.setDrawColor(200, 40, 40);
            doc.setLineWidth(0.6);
            doc.line(companyX, cursorY + 6.5, companyX + 38, cursorY + 6.5);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(60, 60, 60);
            let infoY = cursorY + 11;
            const companyLines = [
                addr?.company_name || "",
                addr?.address_line || "",
            ].filter(Boolean);
            companyLines.forEach((line) => { doc.text(line, companyX, infoY); infoY += 3.6; });

            doc.setFont("helvetica", "bold");
            doc.text("Registration No.:- ", companyX, infoY);
            doc.setFont("helvetica", "normal");
            doc.text(addr?.company_registration_no || "", companyX + 28, infoY);
            infoY += 3.6;
            doc.setFont("helvetica", "bold");
            doc.text("VAT No.:- ", companyX, infoY);
            doc.setFont("helvetica", "normal");
            doc.text(addr?.tax_vat_no || "", companyX + 14, infoY);
            infoY += 3.6;
            doc.setFont("helvetica", "bold");
            doc.text("Importers code:- ", companyX, infoY);
            doc.setFont("helvetica", "normal");
            doc.text(addr?.postal_code || "", companyX + 24, infoY);

            cursorY = margin + 28;

            // Title Bar
            doc.setDrawColor(27, 34, 69);
            doc.setLineWidth(0.5);
            doc.rect(margin, cursorY, contentWidth, 7);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(20, 20, 20);
            doc.text("FREIGHT ESTIMATE", pageWidth / 2, cursorY + 4.8, { align: "center" });
            cursorY += 7;

            // Two-column Info Box
            const rowH = 4.5;
            const barH = 5.5;
            const pad = 3;
            const lPad = 3;
            const lW = contentWidth / 2 - lPad * 2;
            const rW = contentWidth / 2 - lPad * 2;
            const drawRow = (doc, x, rowTop, width, label, value) => {
                const baseline = rowTop + rowH * 0.68;
                drawLabelValueRow(doc, x, baseline, width, label, value);
            };

            const boxTop = cursorY;

            // Left Column
            let ly = boxTop + pad;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(20, 20, 20);
            doc.text(String(freight.client_name || ""), margin + lPad, ly + 2.5);
            ly += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.text(String(freight.address_1 || ""), margin + lPad, ly + 2.5, { maxWidth: lW });
            ly += 5;

            drawSectionBar(doc, margin, ly, contentWidth / 2, barH, "Cargo Details ISO Commodity");
            ly += barH;

            const leftFields = [
                ["Commodity", freight.product_desc || freight.commodity || ""],
                ["Hazardous", freight.hazardous?.toLowerCase() === "no" ? "No" : (freight.hazard_type || freight.hazardous || "")],
                ["No. of Packages", freight.no_of_packages || ""],
                ["Package Type", freight.package_type || ""],
                ["Gross Weight (kgs)", freight.weight || ""],
                ["Dimensions (M3)", freight.dimension || ""],
                ["Volumetric (kgs)", freight.volumetric_weight || ""],
                ["Chargeable", freight.chargeable || ""],
            ];
            leftFields.forEach(([label, value]) => {
                drawRow(doc, margin + lPad, ly, lW, label, value);
                ly += rowH;
            });

            drawSectionBar(doc, margin, ly, contentWidth / 2, barH, "Rate of Exchange");
            ly += barH;

            drawRow(doc, margin + lPad, ly, lW, "Base Currency", freight.final_base_currency || "");
            ly += rowH;
            drawRow(doc, margin + lPad, ly, lW, "Payment Terms", freight.payment_terms || "");
            ly += rowH;
            ly += pad;

            // Right Column
            let ry = boxTop + pad - 0.7;
            const rightColX = colSplitX + lPad;

            const shipmentDate = (quoteDateVal) => {
                if (!quoteDateVal) return "";
                const d = new Date(quoteDateVal);
                if (isNaN(d.getTime())) return quoteDateVal;
                return d.toLocaleDateString("en-GB");
            };

            const invoiceFields = [
                ["Invoice For", freight.invoice_for_country || ""],
                ["Client Ref", freight.customer_invoice_no || ""],
                ["Reference", freight.reference_no || ""],
                ["Quote Date", shipmentDate(freight.quote_date || freight.date)],
                ["Quote Validity", freight.quote_validity || ""],
            ];
            invoiceFields.forEach(([label, value]) => {
                drawRow(doc, rightColX, ry, rW, label, value);
                ry += rowH;
            });

            drawSectionBar(doc, colSplitX, ry, contentWidth / 2, barH, "Routing Details");
            ry += barH + 2;

            const routingFields = [
                ["Country of Origin", freight.collection_from_name || ""],
                ["Place of Receipt", freight.place_of_receipt || ""],
                ["Port of Loading", freight.port_of_loading || ""],
                ["Port of Discharge", freight.post_of_discharge || ""],
                ["Place of Delivery", freight.delivery_to_name || ""],
                ["Incoterm", freight.incoterm || ""],
                ["Mode of Transport", freight.freight || ""],
                ["Freight No", freight.freight_number || ""],
            ];
            routingFields.forEach(([label, value]) => {
                drawRow(doc, rightColX, ry, rW, label, value);
                ry += rowH;
            });

            drawSectionBar(doc, colSplitX, ry, contentWidth / 2, barH, "Freight details");
            ry += barH + 2;

            const freightDetailsFields = [
                ["Load type", freight.fcl_lcl || ""],
                ["Transit Priority", freight.type || ""],
                ["Insurance", freight.insurance || ""],
            ];
            freightDetailsFields.forEach(([label, value]) => {
                drawRow(doc, rightColX, ry, rW, label, value);
                ry += rowH;
            });
            ry += pad;

            // Borders
            const leftBoxH = ly - boxTop;
            const rightBoxH = ry - boxTop;
            const outerBoxH = Math.max(leftBoxH, rightBoxH);

            doc.setDrawColor(27, 34, 69);
            doc.setLineWidth(0.5);
            doc.rect(margin, boxTop, contentWidth, outerBoxH);
            doc.line(colSplitX, boxTop, colSplitX, boxTop + outerBoxH);

            cursorY = boxTop + outerBoxH + 4;

            // Quote Information Section
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(20, 20, 20);
            doc.text("QUOTE INFORMATION", margin, cursorY);
            cursorY += 3;

            const components = freight.components || [];

            const filterBySection = (name) => {
                return components.filter(c => String(c.name || c.section_name || "").toLowerCase().includes(name.toLowerCase()));
            };

            const originRows = filterBySection("Origin Charges");
            const freightRows = filterBySection("Freight Charges");
            const transitRows = filterBySection("Transit Charges");
            const destinationRows = filterBySection("Destination Charges");
            const adminRows = filterBySection("Admin Charges");
            const customsRows = filterBySection("Customs Charges");

            const getSectionTotals = (rows) => {
                let tCost = 0;
                let finalAmt = 0;
                let disc = 0;
                let exclusive = 0;
                let vat = 0;
                let inclusive = 0;

                rows.forEach(c => {
                    tCost += cleanParseFloat(c.total_cost);
                    finalAmt += cleanParseFloat(c.final_amount);
                    disc += cleanParseFloat(c.discount);
                    exclusive += cleanParseFloat(c.exclusive);
                    vat += cleanParseFloat(c.vat);
                    inclusive += cleanParseFloat(c.vat_incl || c.inclusive || c.total);
                });

                return { tCost, finalAmt, disc, exclusive, vat, inclusive };
            };

            const originTotals = getSectionTotals(originRows);
            const freightTotals = getSectionTotals(freightRows);
            const transitTotals = getSectionTotals(transitRows);
            const destinationTotals = getSectionTotals(destinationRows);
            const adminTotals = getSectionTotals(adminRows);
            const customsTotals = getSectionTotals(customsRows);

            const sectionStyle = { fillColor: [240, 242, 245], fontStyle: "bold", halign: "left", textColor: [20, 20, 20] };
            const totalStyle = { fillColor: [250, 250, 250], fontStyle: "bold", textColor: [20, 20, 20] };
            const styledCell = (content, styles) => ({ content: content ?? "", styles });

            const buildSectionRows = (sectionTitle, rows, totals) => {
                if (rows.length === 0) return [];
                const sectionRows = [];

                sectionRows.push([{ content: sectionTitle, colSpan: 17, styles: sectionStyle }]);

                rows.forEach(c => {
                    const vatPctStr = formatValue(getVatPercent(c.vat_type), 2, true);
                    const vatDisplay = (c.vat_type === "Manual VAT" || c.vat_type === "Manual VAT (Capital Goods)")
                        ? formatValue(c.vat, 2)
                        : formatValue(c.vat, 2);

                    sectionRows.push([
                        c.description || c.component_description || "",
                        c.qty !== null && c.qty !== undefined ? String(c.qty) : "",
                        c.currency || "",
                        formatValue(c.cost, 2),
                        c.unit_type || "",
                        c.unit_type === "W/M" ? formatValue(c.unit, 3) : formatValue(c.unit, 2),
                        formatValue(c.total_cost, 2),
                        c.gp_percent !== null && c.gp_percent !== undefined ? String(c.gp_percent) : "",
                        formatValue(c.sales_price, 2),
                        formatValue(c.roe, 4),
                        formatValue(c.final_amount, 2),
                        vatPctStr,
                        formatValue(c.disc_percent, 2, true),
                        formatValue(c.discount, 2),
                        formatValue(c.exclusive, 2),
                        vatDisplay,
                        formatValue(c.vat_incl, 2),
                    ]);

                    if (c.comment && String(c.comment).trim() !== "") {
                        sectionRows.push([
                            {
                                content: `Comment: ${c.comment}`,
                                colSpan: 17,
                                styles: {
                                    fontStyle: "italic",
                                    textColor: [90, 90, 90],
                                    cellWidth: "auto",
                                    overflow: "linebreak",
                                    halign: "left",
                                },
                            },
                        ]);
                    }
                });

                sectionRows.push([
                    { content: `Total - ${sectionTitle}`, colSpan: 6, styles: { ...totalStyle, halign: "left" } },
                    styledCell(formatValue(totals.tCost, 2), { ...totalStyle, halign: "right" }),
                    styledCell("", totalStyle),
                    styledCell("", totalStyle),
                    styledCell(formatValue(totals.finalAmt, 2), { ...totalStyle, halign: "right" }),
                    styledCell("", totalStyle),
                    styledCell("", totalStyle),
                    styledCell("", totalStyle),
                    styledCell("", totalStyle),
                    styledCell(formatValue(totals.disc, 2), { ...totalStyle, halign: "right" }),
                    styledCell(formatValue(totals.exclusive, 2), { ...totalStyle, halign: "right" }),
                    styledCell(formatValue(totals.vat, 2), { ...totalStyle, halign: "right" }),
                    styledCell(formatValue(totals.inclusive, 2), { ...totalStyle, halign: "right" }),
                ]);

                return sectionRows;
            };

            const grandTotalFinalAmt = [...originRows, ...freightRows, ...transitRows, ...destinationRows, ...adminRows, ...customsRows].reduce((s, c) => s + cleanParseFloat(c.final_amount), 0);
            const grandTotalDisc = [...originRows, ...freightRows, ...transitRows, ...destinationRows, ...adminRows, ...customsRows].reduce((s, c) => s + cleanParseFloat(c.discount), 0);
            const grandTotalExclusive = [...originRows, ...freightRows, ...transitRows, ...destinationRows, ...adminRows, ...customsRows].reduce((s, c) => s + cleanParseFloat(c.exclusive), 0);
            const grandTotalVat = [...originRows, ...freightRows, ...transitRows, ...destinationRows, ...adminRows, ...customsRows].reduce((s, c) => s + cleanParseFloat(c.vat), 0);
            const totalVatInclusive = [...originRows, ...freightRows, ...transitRows, ...destinationRows, ...adminRows, ...customsRows].reduce((s, c) => s + cleanParseFloat(c.vat_incl || c.inclusive || c.total), 0);

            const tableBody = [
                ...buildSectionRows("Origin Charges", originRows, originTotals),
                ...buildSectionRows("Freight Charges", freightRows, freightTotals),
                ...buildSectionRows("Transit Charges", transitRows, transitTotals),
                ...buildSectionRows("Destination Charges", destinationRows, destinationTotals),
                ...buildSectionRows("Admin Charges", adminRows, adminTotals),
                ...buildSectionRows("Customs Charges", customsRows, customsTotals),

                // Grand total
                [
                    { content: "TOTAL CHARGE", colSpan: 10, styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "left", textColor: [20, 20, 20] } },
                    { content: formatValue(grandTotalFinalAmt, 2), styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right", textColor: [20, 20, 20] } },
                    { content: "", styles: { fillColor: [226, 232, 240] } },
                    { content: "", styles: { fillColor: [226, 232, 240] } },
                    { content: formatValue(grandTotalDisc, 2), styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right" } },
                    { content: formatValue(grandTotalExclusive, 2), styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right" } },
                    { content: formatValue(grandTotalVat, 2), styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right" } },
                    { content: formatValue(totalVatInclusive, 2), styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right", textColor: [20, 20, 20] } },
                ],
            ];

            autoTable(doc, {
                startY: cursorY,
                margin: { left: margin, right: margin, top: margin, bottom: 14 },
                head: [[
                    "Description", "QTY", "Currency", "Cost", "Unit Type", "Unit",
                    "T/ Cost", "GP%", "Sales/ P", "ROE", "Total",
                    "Vat %", "Disc %", "Discount", "Exclusive", "VAT", "Total",
                ]],
                body: tableBody,
                theme: "grid",
                styles: {
                    fontSize: 7.5,
                    cellPadding: 1.6,
                    valign: "middle",
                    lineColor: [28, 28, 28],
                    lineWidth: 0.1,
                    textColor: [20, 20, 20],
                },
                headStyles: {
                    fillColor: [27, 34, 69],
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                    halign: "left",
                    lineColor: [255, 255, 255],
                },
                rowPageBreak: "avoid",
                showHead: "everyPage",
            });

            // Page numbers
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(120, 120, 120);
                doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
            }

            doc.save(`CD-FreightQuoteEstimate-${freight.reference_no?.trim() || "CD-FreightQuoteEstimate"}.pdf`);
            toast.success(response.data.massage || "PDF estimation downloaded successfully");
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error(error.response?.data?.message || "Failed to generate PDF");
        } finally {
            setLoader(false);
        }
    };

    const currentTotal = activeTab === "collection"
        ? pagenationData?.collectionTotal
        : pagenationData?.deliveryTotal;

    const totalPages = currentTotal && pagenationData?.limit
        ? Math.ceil(currentTotal / pagenationData.limit)
        : 1;

    const currentData = activeTab === "collection" ? collection : delivery;

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setCurrentPage(1);
        FetchCollectDeliveryList(1, value)
    };

    return (
        <>
            <div className="wpWrapper">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between my-3">
                        <h4 className="freight_hd">Collection and Delivery
                            Module</h4>
                        <div className="d-flex">
                            <input
                                type="text"
                                placeholder="Search"
                                className="px-2 py-1"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <ul className="nav nav-tabs mb-3">
                        <li className="nav-item" style={{ cursor: "pointer" }}>
                            <a
                                className={`nav-link ${activeTab === 'collection' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                                onClick={() => { setActiveTab('collection'); setCurrentPage(1); }}
                            >
                                Collection
                            </a>
                        </li>
                        <li className="nav-item" style={{ cursor: "pointer" }}>
                            <a
                                className={`nav-link ${activeTab === 'delivery' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                                onClick={() => { setActiveTab('delivery'); setCurrentPage(1); }}
                            >
                                Delivery
                            </a>
                        </li>
                    </ul>

                    {/* ---------------- TABLE ---------------- */}
                    {loader ? (
                        <div className="loader-container">
                            <div className="loader"></div>
                            <p className="loader-text">Updating...
                                This may take some time</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped tableICon supplierMainTable">
                                <tbody>
                                    {currentData && currentData.length > 0 &&
                                        currentData.map((item, index) => (
                                            <tr key={index}>
                                                <td className="list_bd">
                                                    <div>
                                                        {/* First row */}
                                                        <div className="row align-items-center">
                                                            <div className="col-md-3 my-2">
                                                                <div>
                                                                    <p className="client_nm" style={{ fontSize: "14px" }}>
                                                                        {item.client_name}
                                                                    </p>
                                                                    <p>{item.freight_number} | {item.order_number}</p>
                                                                    <p>
                                                                        <span className="bold600">Type:</span> {item.type}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3">
                                                                {activeTab === 'collection' ? (
                                                                    <>
                                                                        <p className="mb-1"><span className="bold600">Collection:</span> {item.ready_for_collection}</p>
                                                                        <p className="mb-1"><span className="bold600">Supplier:</span> {item.collection_supplier_name || "-"}</p>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <p className="mb-1"><span className="bold600">Delivery:</span> {item.require_for_delivery}</p>
                                                                        <p className="mb-1"><span className="bold600">Supplier:</span> {item.delivery_supplier_name || "-"}</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="col-md-3">
                                                                <div className="d-flex align-items-center">
                                                                    <p className="origin">{item.collection_from_name}</p>
                                                                    <div className="arrow">
                                                                        <i className="fi fi-rr-arrow-right mx-2 arr_icon"></i>
                                                                    </div>
                                                                    <p className="origin">{item.delivery_to_name}</p>{" "} ({item.freight})
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3">
                                                                {activeTab === 'collection' ? (
                                                                    <>
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="bold600 me-2">Status:</span>
                                                                            {item.ready_for_collection?.toLowerCase() === "yes" ? (
                                                                                <select
                                                                                    className="form-select-sm w-auto d-inline-block"
                                                                                    value={item.ready_for_collection_status || "Pending"}
                                                                                    onChange={(e) => handleStatusChange(item, "collection", e)}
                                                                                >
                                                                                    <option value="Pending">Pending</option>
                                                                                    <option value="Assigned">Assigned</option>
                                                                                    <option value="Complete">Confirm</option>
                                                                                </select>
                                                                            ) : (
                                                                                item.ready_for_collection_status || "-"
                                                                            )}
                                                                        </div>
                                                                        <div className="d-flex align-items-center">
                                                                            <i
                                                                                class="fa fa-tasks me-2 mt-2"
                                                                                style={{
                                                                                    color: "#1d2044",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                                onClick={() => handleTasksClick(item)}
                                                                            />
                                                                            <FaEdit
                                                                                onClick={() => {
                                                                                    console.log("FaEdit clicked under collection for item:", item);
                                                                                    handleEditClick(item);
                                                                                }}
                                                                                style={{ cursor: "pointer", color: "#1d2044" }}
                                                                                className="me-2"
                                                                            />
                                                                            <VisibilityIcon onClick={() => handleViewClick(item)} style={{ cursor: "pointer", color: "#1d2044" }} className="me-2" />
                                                                            <PictureAsPdfIcon onClick={() => handlePdfPrint(item)} style={{ cursor: "pointer", color: "#1d2044" }} />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="bold600 me-2">Status:</span>
                                                                            {item.require_for_delivery?.toLowerCase() === "yes" ? (
                                                                                <select
                                                                                    className="form-select-sm w-auto d-inline-block"
                                                                                    value={item.require_for_delivery_status || "Pending"}
                                                                                    onChange={(e) => handleStatusChange(item, "delivery", e)}
                                                                                >
                                                                                    <option value="Pending">Pending</option>
                                                                                    <option value="Assigned">Assigned</option>
                                                                                    <option value="Complete">Complete</option>
                                                                                </select>
                                                                            ) : (
                                                                                item.require_for_delivery_status || "-"
                                                                            )}
                                                                        </div>
                                                                        <div className="d-flex align-items-center">
                                                                            <i
                                                                                className="fa fa-tasks me-2 mt-2"
                                                                                style={{
                                                                                    color: "#1d2044",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                                onClick={() => handleTasksClick(item)}
                                                                            />
                                                                            <FaEdit
                                                                                onClick={() => {
                                                                                    console.log("FaEdit clicked under delivery for item:", item);
                                                                                    handleEditClick(item);
                                                                                }}
                                                                                style={{ cursor: "pointer", color: "#1d2044" }}
                                                                                className="me-2"
                                                                            />
                                                                            <VisibilityIcon onClick={() => handleViewClick(item)} style={{ cursor: "pointer", color: "#1d2044" }} className="me-2" />
                                                                            <PictureAsPdfIcon onClick={() => handlePdfPrint(item)} style={{ cursor: "pointer", color: "#1d2044" }} />
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-end align-items-end">
                                <button
                                    disabled={currentPage === 1}
                                    className="bg_page"
                                    onClick={() => {
                                        setCurrentPage(currentPage - 1);
                                    }}
                                >
                                    <i class="fi fi-rr-angle-small-left page_icon"></i>
                                </button>
                                <span className="mx-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    disabled={currentPage === totalPages}
                                    className="bg_page"
                                    onClick={() => {
                                        setCurrentPage(currentPage + 1);
                                    }}
                                >
                                    <i class="fi fi-rr-angle-small-right page_icon"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {taskModalOpen && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Assign Supplier</h5>
                                <button type="button" className="btn btn-close" onClick={() => setTaskModalOpen(false)}><CloseIcon /></button>
                            </div>
                            <div className="modal-body text-dark">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Select Supplier</label>
                                    <select
                                        className="form-select"
                                        value={taskSelectedSupplier}
                                        onChange={(e) => setTaskSelectedSupplier(e.target.value)}
                                    >
                                        <option value="">-- Select Supplier --</option>
                                        {supplierList.map(sup => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setTaskModalOpen(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={assignSupplierForTask} disabled={!taskSelectedSupplier}>Assign & Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalOpen && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Assign Supplier</h5>
                                <button type="button" className="btn btn-close" onClick={() => setModalOpen(false)}><CloseIcon /></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Select Supplier</label>
                                    <select
                                        className="form-select"
                                        value={selectedSupplier}
                                        onChange={(e) => setSelectedSupplier(e.target.value)}
                                    >
                                        <option value="">-- Select Supplier --</option>
                                        {supplierList.map(sup => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={() => updateStatus(modalData.item.freight_id, modalData.type, modalData.status, selectedSupplier)} disabled={!selectedSupplier}>Assign & Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {completeModalOpen && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Complete Collection</h5>
                                <button type="button" className="btn btn-close" onClick={() => setCompleteModalOpen(false)}><CloseIcon /></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label d-block fw-bold">Select Action</label>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="completeAction"
                                            id="actionShipment"
                                            value="shipment"
                                            checked={completeAction === "shipment"}
                                            onChange={(e) => handleActionChange(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="actionShipment">Shipment</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="completeAction"
                                            id="actionWarehouse"
                                            value="warehouse"
                                            checked={completeAction === "warehouse"}
                                            onChange={(e) => handleActionChange(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="actionWarehouse">Warehouse</label>
                                    </div>
                                </div>

                                {completeAction === "shipment" && (
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Select Waybill</label>
                                        {completeLoader ? (
                                            <div>Loading waybills...</div>
                                        ) : (
                                            <select
                                                className="form-select"
                                                value={selectedShipmentId}
                                                onChange={(e) => setSelectedShipmentId(e.target.value)}
                                            >
                                                <option value="">-- Select Waybill --</option>
                                                {waybillList.map((wb, idx) => (
                                                    <option key={`${wb.shipment_id}-${idx}`} value={wb.shipment_id}>
                                                        {wb.waybill}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setCompleteModalOpen(false)}>Cancel</button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={submitCollectionCompletion}
                                    disabled={
                                        !completeAction ||
                                        (completeAction === "shipment" && !selectedShipmentId) ||
                                        completeLoader
                                    }
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editModalOpen && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                            <div className="modal-header" style={{ background: '#1d2044', color: '#fff' }}>
                                <h5 className="modal-title fw-bold">Edit Collection / Delivery Details</h5>
                                <button type="button" className="btn btn-close btn-close-white" onClick={() => setEditModalOpen(false)} style={{ filter: 'invert(1)' }}><CloseIcon /></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="row g-3 text-dark">
                                    {/* SECTION 1: GENERAL INFO */}
                                    <div className="col-12 border-bottom pb-2 mb-2">
                                        <h6 className="fw-bold text-primary mb-0">General Information</h6>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Customer Ref</label>
                                        <input type="text" className="form-control" name="customer_ref" value={editForm.customer_ref} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Date Picked Up</label>
                                        <input type="date" className="form-control" name="date_picked_up" value={editForm.date_picked_up} onChange={handleFormChange} />
                                    </div>

                                    {/* SECTION 2: SUPPLIER INFO */}
                                    <div className="col-12 border-bottom pb-2 mb-2 mt-4">
                                        <h6 className="fw-bold text-primary mb-0">Supplier & Pickup Information</h6>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Supplier Name</label>
                                        <input type="text" className="form-control" name="supplier_name" value={editForm.supplier_name} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Contact Person</label>
                                        <input type="text" className="form-control" name="supplier_contact_person" value={editForm.supplier_contact_person} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Contact Number</label>
                                        <input type="text" className="form-control" name="supplier_contact" value={editForm.supplier_contact} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Pickup Address</label>
                                        <textarea className="form-control" name="pickup_address" rows="2" value={editForm.pickup_address} onChange={handleFormChange}></textarea>
                                    </div>

                                    {/* SECTION 3: WAREHOUSE & PACKAGE DETAILS */}
                                    <div className="col-12 border-bottom pb-2 mb-2 mt-4">
                                        <h6 className="fw-bold text-primary mb-0">Warehouse & Package Details</h6>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Create New Warehouse Order</label>
                                        <select className="form-select" name="create_new_warehouse_order" value={editForm.create_new_warehouse_order} onChange={handleFormChange}>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Warehouse Order ID</label>
                                        <input type="text" className="form-control" name="warehouse_order_id" value={editForm.warehouse_order_id} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Courier Waybill Ref</label>
                                        <input type="text" className="form-control" name="courier_waybill_ref" value={editForm.courier_waybill_ref} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Box Marking</label>
                                        <input type="text" className="form-control" name="box_marking" value={editForm.box_marking} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Package Type</label>
                                        <input type="text" className="form-control" name="package_type" value={editForm.package_type} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Goods Description</label>
                                        <input type="text" className="form-control" name="goods_description" value={editForm.goods_description} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Total Packages</label>
                                        <input type="number" className="form-control" name="total_packages" value={editForm.total_packages} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Total CBM</label>
                                        <input type="number" step="any" className="form-control" name="total_cbm" value={editForm.total_cbm} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Total Weight (kg)</label>
                                        <input type="number" step="any" className="form-control" name="total_weight" value={editForm.total_weight} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Package Comments</label>
                                        <input type="text" className="form-control" name="package_comments" value={editForm.package_comments} onChange={handleFormChange} />
                                    </div>

                                    {/* SECTION 4: HAZARDOUS & COSTS */}
                                    <div className="col-12 border-bottom pb-2 mb-2 mt-4">
                                        <h6 className="fw-bold text-primary mb-0">Hazardous Status & Costing Information</h6>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Hazardous</label>
                                        <select className="form-select" name="hazardous" value={editForm.hazardous} onChange={handleFormChange}>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    <div className="col-md-9">
                                        <label className="form-label fw-semibold">Hazardous Description</label>
                                        <input type="text" className="form-control" name="hazardous_description" value={editForm.hazardous_description} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Costs to Collect</label>
                                        <input type="number" className="form-control" name="costs_to_collect" value={editForm.costs_to_collect} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Handling Cost</label>
                                        <input type="number" className="form-control" name="handling_cost" value={editForm.handling_cost} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Warehouse Cost</label>
                                        <input type="number" className="form-control" name="warehouse_cost" value={editForm.warehouse_cost} onChange={handleFormChange} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Warehouse Comment</label>
                                        <textarea className="form-control" name="warehouse_comment" rows="2" value={editForm.warehouse_comment} onChange={handleFormChange}></textarea>
                                    </div>

                                    {/* SECTION 5: ATTACHMENTS */}
                                    <div className="col-12 border-bottom pb-2 mb-2 mt-4">
                                        <h6 className="fw-bold text-primary mb-0">Attachments</h6>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Box Marking Attachment</label>
                                        <input type="file" className="form-control" onChange={(e) => handleFileChange(e, 'box_marking_attachment')} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Goods Description Attachment</label>
                                        <input type="file" className="form-control" onChange={(e) => handleFileChange(e, 'goods_description_attachment')} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Product Pictures</label>
                                        <input type="file" className="form-control" onChange={(e) => handleFileChange(e, 'product_pictures')} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Other Attachments</label>
                                        <input type="file" className="form-control" onChange={(e) => handleFileChange(e, 'other_attachments')} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
                                <button type="button" className="btn btn-secondary px-4" onClick={() => setEditModalOpen(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary px-4" onClick={submitEditForm} style={{ background: '#1d2044', borderColor: '#1d2044' }}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewModalOpen && viewDetails && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content text-dark" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
                            <div className="modal-header" style={{ background: '#1d2044', color: '#fff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                                <h5 className="modal-title fw-bold">Collection & Delivery Details</h5>
                                <button type="button" className="btn btn-close btn-close-white" onClick={() => setViewModalOpen(false)} style={{ filter: 'invert(1)' }}><CloseIcon /></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                <div className="formDetails p-0">
                                    <div className="details_box viewDetails">
                                        <div className="row g-3">
                                            {/* CARD 1: FREIGHT DETAILS */}
                                            <div className="col-md-4 pe-2">
                                                <div className="card desti_card">
                                                    <div className="card-body">
                                                        <div>
                                                            <h6 className="orgin_hd">Freight Details</h6>
                                                        </div>
                                                        <div className="main_det">
                                                            <div className="view_box">
                                                                <h6 className="ship_hd">
                                                                    <i className="fi fi-rs-receipt build_icon"></i> Freight Information
                                                                </h6>
                                                                <div className="d-flex align-items-start">
                                                                    <div>
                                                                        <p className="client_para">Freight Number:</p>
                                                                        <p className="or_para">{viewDetails.freight_details?.freight_number || "-"}</p>

                                                                        <p className="client_para">Client Email:</p>
                                                                        <p className="or_para">{viewDetails.freight_details?.client_email || "-"}</p>

                                                                        <p className="client_para">Freight Type:</p>
                                                                        <p className="or_para">{viewDetails.freight_details?.freight_type || "-"}</p>

                                                                        <p className="client_para">Transport Mode:</p>
                                                                        <p className="or_para">{viewDetails.freight_details?.freight || "-"}</p>

                                                                        <p className="client_para">Incoterm:</p>
                                                                        <p className="or_para">{viewDetails.freight_details?.incoterm || "-"}</p>

                                                                        <p className="client_para">Product Desc:</p>
                                                                        <p className="or_para">{viewDetails.freight_details?.product_desc || "-"}</p>

                                                                        <p className="client_para">Dimension:</p>
                                                                        <p className="or_para">{viewDetails.freight_details?.dimension || "-"}</p>

                                                                        <p className="client_para">Weight:</p>
                                                                        <p className="or_para">{viewDetails.freight_details?.weight ? `${viewDetails.freight_details.weight} kg` : "-"}</p>

                                                                        <p className="client_para">Volumetric Wt:</p>
                                                                        <p className="or_para">{viewDetails.freight_details?.volumetric_weight || "-"}</p>

                                                                        <p className="client_para">Packages Count:</p>
                                                                        <p className="or_para">{viewDetails.freight_details?.no_of_packages} ({viewDetails.freight_details?.package_type || "-"})</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CARD 2: ORDER DETAILS */}
                                            <div className="col-md-4 pe-2">
                                                <div className="card desti_card">
                                                    <div className="card-body">
                                                        <div>
                                                            <h6 className="orgin_hd">Order Details</h6>
                                                        </div>
                                                        <div className="main_det">
                                                            <div className="view_box">
                                                                <h6 className="ship_hd">
                                                                    <i className="fi fi-rs-document build_icon"></i> Order Information
                                                                </h6>
                                                                <div className="d-flex align-items-start">
                                                                    <div>
                                                                        <p className="client_para">Order Number:</p>
                                                                        <p className="or_para">{viewDetails.order_details?.order_number || "-"}</p>

                                                                        <p className="client_para">Goods Description:</p>
                                                                        <p className="or_para">{viewDetails.order_details?.goods_description || "-"}</p>

                                                                        <p className="client_para">Customs Clearing:</p>
                                                                        <p className="or_para">{viewDetails.order_details?.customs_clearing || "-"}</p>

                                                                        <p className="client_para">Dimensions:</p>
                                                                        <p className="or_para">{viewDetails.order_details?.dimensions || "-"}</p>

                                                                        <p className="client_para">Weight:</p>
                                                                        <p className="or_para">{viewDetails.order_details?.weight ? `${viewDetails.order_details.weight} kg` : "-"}</p>

                                                                        <p className="client_para">Special Comments:</p>
                                                                        <p className="or_para">{viewDetails.order_details?.special_comments || "-"}</p>

                                                                        <p className="client_para">Shipper Info:</p>
                                                                        <div className="or_para">
                                                                            <div>{viewDetails.order_details?.shipper || "-"}</div>
                                                                            <div className="small text-muted">{viewDetails.order_details?.shipper_email}</div>
                                                                            <div className="small text-muted">{viewDetails.order_details?.shipper_tel}</div>
                                                                            <div className="small text-muted">{viewDetails.order_details?.shipper_address}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CARD 3: COLLECTION DELIVERY DETAILS */}
                                            <div className="col-md-4">
                                                <div className="card desti_card">
                                                    <div className="card-body">
                                                        <div>
                                                            <h6 className="orgin_hd">Collection & Delivery Details</h6>
                                                        </div>
                                                        <div className="main_det">
                                                            <div className="view_box">
                                                                <h6 className="ship_hd">
                                                                    <i className="fi fi-rs-truck build_icon"></i> Collection & Delivery
                                                                </h6>
                                                                {!viewDetails.collection_delivery_details || !viewDetails.collection_delivery_details.collection_delivery_id ? (
                                                                    <div className="text-center py-4">
                                                                        <p className="text-muted small fw-semibold">No collection & delivery details added yet.</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="d-flex align-items-start">
                                                                        <div>
                                                                            <p className="client_para">Supplier Name:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.supplier_name || "-"}</p>

                                                                            <p className="client_para">Contact Person:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.supplier_contact_person || "-"}</p>

                                                                            <p className="client_para">Contact Number:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.supplier_contact || "-"}</p>

                                                                            <p className="client_para">Pickup Address:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.pickup_address || "-"}</p>

                                                                            <p className="client_para">Customer Ref:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.customer_ref || "-"}</p>

                                                                            <p className="client_para">Warehouse Order ID:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.warehouse_order_id || "-"}</p>

                                                                            <p className="client_para">Courier Waybill Ref:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.courier_waybill_ref || "-"}</p>

                                                                            <p className="client_para">Box Marking:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.box_marking || "-"}</p>

                                                                            <p className="client_para">Goods Description:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.goods_description || "-"}</p>

                                                                            <p className="client_para">Package Type:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.package_type || "-"}</p>

                                                                            <p className="client_para">Total Packages:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.total_packages || "-"}</p>

                                                                            <p className="client_para">Total CBM:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.total_cbm || "-"}</p>

                                                                            <p className="client_para">Total Weight:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.total_weight || "-"}</p>

                                                                            <p className="client_para">Costs to Collect:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.costs_to_collect || "-"}</p>

                                                                            <p className="client_para">Handling Cost:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.handling_cost || "-"}</p>

                                                                            <p className="client_para">Warehouse Cost:</p>
                                                                            <p className="or_para">{viewDetails.collection_delivery_details.warehouse_cost || "-"}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ATTACHMENTS CARD */}
                                            {viewDetails.collection_delivery_details && viewDetails.collection_delivery_details.collection_delivery_id && (
                                                <div className="col-12 mt-3">
                                                    <div className="card desti_card">
                                                        <div className="card-body">
                                                            <div>
                                                                <h6 className="orgin_hd">Attachments</h6>
                                                            </div>
                                                            <div className="main_det mt-3">
                                                                <div className="row g-3">
                                                                    <div className="col-md-3">
                                                                        <span className="fw-semibold d-block text-muted small mb-2">Box Marking Attachment</span>
                                                                        <div className="d-flex flex-wrap gap-2">
                                                                            {viewDetails.collection_delivery_details.box_marking_attachment && viewDetails.collection_delivery_details.box_marking_attachment.length > 0 ? (
                                                                                viewDetails.collection_delivery_details.box_marking_attachment.map((file, i) => (
                                                                                    <div key={i}>
                                                                                        {renderAttachment(file)}
                                                                                    </div>
                                                                                ))
                                                                            ) : "-"}
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <span className="fw-semibold d-block text-muted small mb-2">Goods Desc Attachment</span>
                                                                        <div className="d-flex flex-wrap gap-2">
                                                                            {viewDetails.collection_delivery_details.goods_description_attachment && viewDetails.collection_delivery_details.goods_description_attachment.length > 0 ? (
                                                                                viewDetails.collection_delivery_details.goods_description_attachment.map((file, i) => (
                                                                                    <div key={i}>
                                                                                        {renderAttachment(file)}
                                                                                    </div>
                                                                                ))
                                                                            ) : "-"}
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <span className="fw-semibold d-block text-muted small mb-2">Product Pictures</span>
                                                                        <div className="d-flex flex-wrap gap-2">
                                                                            {viewDetails.collection_delivery_details.product_pictures && viewDetails.collection_delivery_details.product_pictures.length > 0 ? (
                                                                                viewDetails.collection_delivery_details.product_pictures.map((file, i) => (
                                                                                    <div key={i}>
                                                                                        {renderAttachment(file)}
                                                                                    </div>
                                                                                ))
                                                                            ) : "-"}
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <span className="fw-semibold d-block text-muted small mb-2">Other Attachments</span>
                                                                        <div className="d-flex flex-wrap gap-2">
                                                                            {viewDetails.collection_delivery_details.other_attachments && viewDetails.collection_delivery_details.other_attachments.length > 0 ? (
                                                                                viewDetails.collection_delivery_details.other_attachments.map((file, i) => (
                                                                                    <div key={i}>
                                                                                        {renderAttachment(file)}
                                                                                    </div>
                                                                                ))
                                                                            ) : "-"}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
                                <button type="button" className="btn btn-secondary px-4" onClick={() => setViewModalOpen(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            
        </>
    )
}

export default ManageCollectionDelivery;