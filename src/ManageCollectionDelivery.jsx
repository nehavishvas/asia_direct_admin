import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";

const ManageCollectionDelivery = () => {
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

    // Collection completion states
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [completeModalItem, setCompleteModalItem] = useState(null);
    const [completeAction, setCompleteAction] = useState("");
    const [waybillList, setWaybillList] = useState([]);
    const [selectedShipmentId, setSelectedShipmentId] = useState("");
    const [completeLoader, setCompleteLoader] = useState(false);
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
                            <div className="d-flex justify-content-end align-items-end my-3">
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

            <ToastContainer />
        </>
    )
}

export default ManageCollectionDelivery;