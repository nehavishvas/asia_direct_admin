import axios from "axios";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Modal, Box } from "@mui/material";
import { BsThreeDotsVertical, BsTrash, BsPlus } from "react-icons/bs";
import Swal from "sweetalert2";

const pageSize = 10;
export default function Cashbook() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [clients, setClients] = useState([]);
  const [ordersPerRow, setOrdersPerRow] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [quer, setQuer] = useState({
    search: "",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [loader, setLoader] = useState(true);
  const [openAdModal, setOpenAdModal] = useState(false);
  const [adDocumentUrl, setAdDocumentUrl] = useState("");
  const [modalTitle, setModalTitle] = useState("POP Document");

  // Add/Edit and Split States
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [addEditMode, setAddEditMode] = useState("add"); // "add" or "edit"
  const [cashbookForm, setCashbookForm] = useState({
    cashbook_id: "",
    date: "",
    bank_ref: "",
    description_on_receipt: "",
    receipt: "",
  });

  const [openViewSplitsModal, setOpenViewSplitsModal] = useState(false);
  const [openAddSplitsModal, setOpenAddSplitsModal] = useState(false);
  const [viewSplitsData, setViewSplitsData] = useState([]);
  const [selectedCashbook, setSelectedCashbook] = useState(null);
  const [splitRows, setSplitRows] = useState([]);
  const [openSplitMenuId, setOpenSplitMenuId] = useState(null);
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;
  useEffect(() => {
    getCashbookList(currentPage);
    getClients();
  }, [currentPage]);

  const getCashbookList = async (page) => {
    try {
      setLoader(true);
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        {
          staff_id: userid,
          route_url: "/Admin/sageinvoice",
          user_type: usertype,
        }
      );
      if (permission.data.success) {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}GetCashbookList?page=${page}`
        );
        setData(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        fetchOrdersForCustomers(response.data.data);
      } else {
        toast.error("Access Denied");
      }
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoader(false);
    }
  };

  const getClients = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}client-list`
      );
      setClients(response.data.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error.message);
    }
  };

  const fetchOrdersForCustomers = async (data) => {
    const orders = {};
    await Promise.all(
      data.map(async (row) => {
        if (row.customer_id) {
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_BASE_URL}OrderInvoiceList?client_id=${row.customer_id}`
            );
            orders[row.id] = response.data.data || [];
          } catch (error) {
            orders[row.id] = [];
          }
        }
      })
    );
    setOrdersPerRow(orders);
  };
  const handleDropdownChange = async (value, rowId, field) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
    if (field === "customer_id") {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}OrderInvoiceList?client_id=${value}`
        );
        setOrdersPerRow((prev) => ({
          ...prev,
          [rowId]: response.data.data || [],
        }));
      } catch (error) {
        toast.error("Failed to fetch orders.");
      }
      return;
    }
    if (field === "order_ID") {
      const updatedRow = data.find((row) => row.id === rowId);
      if (!updatedRow) return;
      const payload = {
        cashbook_id: rowId,
        customer_id: updatedRow.customer_id,
        order_id: value,
        allocated: updatedRow.allocated,
        receipt: updatedRow.receipt,
      };
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}ADDcashbook`,
          payload
        );
        if (response.data.success) {
          getCashbookList(currentPage);
          toast.success("Updated successfully!");
        } else {
          toast.error("Something went wrong");
        }
      } catch (error) {
        toast.error("Failed to update row.");
      }
    }
  };
  const filteredData = data.filter(
    (item) =>
      item?.description_on_receipt
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.receipt.toString().includes(searchQuery)
  );
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handlelearch = (e) => {
    const { name, value } = e.target;
    setQuer({ ...quer, [name]: value });
  };
  const handlecjh = async () => {
    console.log(quer);
    if (!quer) {
    }
    try {
      setLoader(true);
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        {
          staff_id: userid,
          route_url: "/Admin/sageinvoice",
          user_type: usertype,
        }
      );
      if (permission.data.success) {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}GetCashbookList?search=${quer.search}`
        );
        setQuer({ search: "" });
        setData(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        fetchOrdersForCustomers(response.data.data);
      } else {
        toast.error("Access Denied");
      }
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoader(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  const handleAddNewClick = () => {
    setAddEditMode("add");
    setCashbookForm({
      cashbook_id: "",
      date: new Date().toISOString().split("T")[0],
      bank_ref: "",
      description_on_receipt: "",
      receipt: "",
    });
    setOpenAddEditModal(true);
  };

  const handleEditClick = (item) => {
    setAddEditMode("edit");
    setCashbookForm({
      cashbook_id: item.id || item.cashbook_id,
      date: formatDateForInput(item.date),
      bank_ref: item.bank_ref || "",
      description_on_receipt: item.description_on_receipt || "",
      receipt: item.receipt || "",
    });
    setOpenAddEditModal(true);
  };

  const handleCopyClick = (item) => {
    setAddEditMode("add");
    setCashbookForm({
      cashbook_id: "",
      date: formatDateForInput(item.date),
      bank_ref: item.bank_ref || "",
      description_on_receipt: (item.description_on_receipt || "") + " (Copy)",
      receipt: item.receipt || "",
    });
    setOpenAddEditModal(true);
  };

  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this Cashbook?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        setLoader(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}deleteCashbookById`,
          { cashbook_id: id }
        );
        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response?.data?.message || "Cashbook Deleted successfully.",
            confirmButtonColor: "#3085d6",
          });
          getCashbookList(currentPage);
        } else {
          toast.error(response.data.message || "Failed to delete cashbook.");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Something went wrong!",
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoader(false);
      }
    }
  };

  // View splits
  const handleViewSplitsClick = async (item) => {
    setSelectedCashbook(item);
    try {
      setLoader(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}getCashbookSplitsByCashbookId`,
        { cashbook_id: item.id }
      );
      if (response.data.success) {
        setViewSplitsData(response.data.data || []);
        setOpenViewSplitsModal(true);
      } else {
        toast.error(response.data.message || "Failed to fetch split details.");
      }
    } catch (error) {
      toast.error("Error fetching split details.");
    } finally {
      setLoader(false);
    }
  };

  // Delete individual split
  const handleDeleteIndividualSplit = async (splitId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this split?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        setLoader(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}deleteCashbookSplitById`,
          { split_id: splitId }
        );
        if (response.data.success) {
          toast.success("Split deleted successfully!");
          // Re-fetch splits for the modal
          if (selectedCashbook) {
            const fetchRes = await axios.post(
              `${process.env.REACT_APP_BASE_URL}getCashbookSplitsByCashbookId`,
              { cashbook_id: selectedCashbook.id }
            );
            if (fetchRes.data.success) {
              setViewSplitsData(fetchRes.data.data || []);
            }
          }
          setOpenViewSplitsModal(false);
          getCashbookList(currentPage);
        } else {
          toast.error(response.data.message || "Failed to delete split.");
        }
      } catch (error) {
        toast.error("Error deleting split.");
      } finally {
        setLoader(false);
      }
    }
  };

  // Delete all splits for a cashbook
  const handleDeleteSplitsClick = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete all splits for this Cashbook?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
    });
    if (result.isConfirmed) {
      try {
        setLoader(true);
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}deleteCashbookSplitByCashbookId`,
          { cashbook_id: item.id }
        );
        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response?.data?.message || "All splits deleted successfully.",
            confirmButtonColor: "#3085d6",
          });
          getCashbookList(currentPage);
        } else {
          toast.error(response.data.message || "Failed to delete splits.");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Something went wrong!",
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoader(false);
      }
    }
  };

  // Add splits click handler
  const handleAddSplitsClick = async (item) => {
    if (!item.customer_id || !item.order_id) {
      toast.error("Please select Shipment Reference and Customer first.");
      return;
    }
    setSelectedCashbook(item);

    // Check if the current row has orders loaded in ordersPerRow
    if (!ordersPerRow[item.id] || ordersPerRow[item.id].length === 0) {
      try {
        setLoader(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}OrderInvoiceList?client_id=${item.customer_id}`
        );
        setOrdersPerRow((prev) => ({
          ...prev,
          [item.id]: response.data.data || [],
        }));
      } catch (error) {
        toast.error("Failed to fetch orders.");
        setLoader(false);
        return;
      }
    }

    try {
      setLoader(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}getCashbookSplitsByCashbookId`,
        { cashbook_id: item.id }
      );
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Pre-populate with existing splits
        const mappedRows = response.data.data.map((split) => ({
          order_id: split.order_id,
          allocated_amount: split.allocated_amount,
        }));
        setSplitRows(mappedRows);
      } else {
        // Pre-populate with one empty row
        setSplitRows([{ order_id: "", allocated_amount: "" }]);
      }
      setOpenAddSplitsModal(true);
    } catch (error) {
      toast.error("Error preparing splits form.");
    } finally {
      setLoader(false);
    }
  };

  // Handle split row change
  const handleSplitRowChange = (index, field, value) => {
    setSplitRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  // Add split row
  const handleAddSplitRow = () => {
    const availableOrders = ordersPerRow[selectedCashbook?.id] || [];
    if (splitRows.length >= availableOrders.length) {
      toast.warning("Cannot add more splits than available Shipment References.");
      return;
    }
    setSplitRows((prev) => [...prev, { order_id: "", allocated_amount: "" }]);
  };

  // Remove split row
  const handleRemoveSplitRow = (index) => {
    setSplitRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEditSubmit = async (e) => {
    e.preventDefault();
    if (!cashbookForm.date || !cashbookForm.receipt) {
      toast.error("Please fill all required fields (Date & Receipt).");
      return;
    }
    const payload = {
      date: cashbookForm.date,
      bank_ref: cashbookForm.bank_ref,
      description_on_receipt: cashbookForm.description_on_receipt,
      receipt: parseFloat(cashbookForm.receipt),
    };
    if (addEditMode === "edit") {
      payload.cashbook_id = cashbookForm.cashbook_id;
    }
    try {
      setLoader(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}addUpdateCashbook`,
        payload
      );
      if (response.data.success) {
        toast.success(
          addEditMode === "edit"
            ? "Cashbook updated successfully!"
            : "Cashbook added successfully!"
        );
        setOpenAddEditModal(false);
        getCashbookList(currentPage);
      } else {
        toast.error(response.data.message || "Failed to save cashbook.");
      }
    } catch (error) {
      toast.error(error?.response?.data.message || "Error saving cashbook.");
    } finally {
      setLoader(false);
    }
  };

  // Submit splits
  const handleSaveSplitsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCashbook) return;

    if (splitRows.length === 0) {
      toast.error("Please add at least one split entry.");
      return;
    }

    const orderIds = new Set();
    for (let i = 0; i < splitRows.length; i++) {
      const row = splitRows[i];
      if (!row.order_id) {
        toast.error(`Please select a Shipment Reference for Row ${i + 1}.`);
        return;
      }
      const amount = parseFloat(row.allocated_amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error(`Please enter a valid positive amount for Row ${i + 1}.`);
        return;
      }
      if (orderIds.has(row.order_id)) {
        toast.error("Duplicate Shipment References are not allowed.");
        return;
      }
      orderIds.add(row.order_id);
    }

    const payload = {
      cashbook_id: selectedCashbook.id,
      splits: splitRows.map((row) => ({
        order_id: parseInt(row.order_id, 10),
        allocated_amount: parseFloat(row.allocated_amount),
      })),
    };

    try {
      setLoader(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}addUpdateCashbookSplit`,
        payload
      );
      if (response.data.success) {
        toast.success(response.data.message || "Splits saved successfully!");
        setOpenAddSplitsModal(false);
        getCashbookList(currentPage);
      } else {
        toast.error(response.data.message || "Failed to save splits.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving splits.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {loader ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Updating... Cashbook may take some time</p>
        </div>
      ) : (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="card-body">
              <div className="col-12 d-flex justify-content-between align-items-center manageFreight">
                <button
                  className="btn btn-primary blueBtn"
                  style={{ height: "38px" }}
                  onClick={() => navigate("/Admin/customer-unallocated-report")}
                >
                  Unallocated Report
                </button>
                <div className="d-flex align-items-center">
                  <input
                    className="py-1 rounded ps-1 mx-2"
                    type="text"
                    name="search"
                    onChange={handlelearch}
                    placeholder="Search"
                    style={{ height: "38px" }}
                  />
                  <button className="btn btn-secondary" style={{ height: "38px" }} onClick={handlecjh}>
                    Search
                  </button>
                  <button className="btn btn-primary mx-2" style={{ height: "38px" }} onClick={handleAddNewClick}>
                    Add Cashbook
                  </button>
                </div>
              </div>
              <div className="table-responsive mt-2">
                <table className="table table-striped tableICon">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Bank Ref.</th>
                      <th>Description of Receipt</th>
                      <th>Receipt</th>
                      <th>Payment</th>
                      <th>Customer</th>
                      <th>Shipment Ref</th>
                      <th>Allocated</th>
                      <th>Invoice (POP)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {new Date(item.date).toLocaleDateString("en-GB")}
                          </td>
                          <td>{item.bank_ref}</td>
                          <td>{item.description_on_receipt}</td>
                          <td>{item.receipt}</td>
                          <td>{item.payment}</td>
                          <td>
                            <select
                              onChange={(e) =>
                                handleDropdownChange(
                                  e.target.value,
                                  item.id,
                                  "customer_id"
                                )
                              }
                              value={item.customer_id || ""}
                            >
                              <option value="">Select...</option>
                              {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.full_name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              onChange={(e) =>
                                handleDropdownChange(
                                  e.target.value,
                                  item.id,
                                  "order_ID"
                                )
                              }
                              value={item.order_id || ""}
                            >
                              <option value="">Select...</option>
                              {ordersPerRow[item.id]?.map((order) => (
                                <option
                                  key={order.order_ID}
                                  value={order.order_ID}
                                >
                                  {order.order_number}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>{item.order_id ? "YES" : ""}</td>
                          <td className="text-center">
                            {item.freight_pop_docs && item.freight_pop_docs.filter((doc) => doc.document_name === "POP (AD)").length > 0 ? (
                              item.freight_pop_docs
                                .filter((doc) => doc.document_name === "POP (AD)")
                                .map((doc) => (
                                  <i
                                    key={doc.id}
                                    className="fi fi-rr-document mx-1"
                                    style={{ cursor: "pointer", fontSize: "1.2rem", color: "#007bff" }}
                                    title="View POP Document"
                                    onClick={() => {
                                      setModalTitle("Invoice (POP)");
                                      setAdDocumentUrl(`${process.env.REACT_APP_BASE_URLdocument}${doc.document}`);
                                      setOpenAdModal(true);
                                    }}
                                  ></i>
                                ))
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <div className="dropdown">
                              <div type="button" data-bs-toggle="dropdown" onClick={() => setOpenSplitMenuId(null)}>
                                <BsThreeDotsVertical />
                              </div>
                              <ul className="dropdown-menu">
                                {openSplitMenuId === item.id ? (
                                  <>
                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item fw-bold text-secondary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenSplitMenuId(null);
                                        }}
                                      >
                                        &larr; Back
                                      </button>
                                    </li>
                                    <li>
                                      <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={() => handleViewSplitsClick(item)}
                                      >
                                        View
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item text-danger"
                                        onClick={() => handleDeleteSplitsClick(item)}
                                      >
                                        Delete
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={() => handleAddSplitsClick(item)}
                                      >
                                        Add
                                      </button>
                                    </li>
                                  </>
                                ) : (
                                  <>
                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenSplitMenuId(item.id);
                                        }}
                                      >
                                        Split
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={() => handleEditClick(item)}
                                      >
                                        Edit
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={() => handleCopyClick(item)}
                                      >
                                        Copy
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item text-danger"
                                        onClick={() => handleDeleteClick(item.id)}
                                      >
                                        Delete
                                      </button>
                                    </li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center">
                          No data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="text-center d-flex justify-content-end align-items-center">
                  <button
                    disabled={currentPage === 1}
                    className="bg_page"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <i className="fi fi-rr-angle-small-left page_icon"></i>
                  </button>
                  <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                  <button
                    disabled={currentPage === totalPages}
                    className="bg_page"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <i className="fi fi-rr-angle-small-right page_icon"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* View Document Modal */}
            <Modal open={openAdModal} onClose={() => setOpenAdModal(false)}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "80%",
                  height: "80vh",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="d-flex justify-content-between mb-2">
                  <h5>{modalTitle}</h5>
                  <button
                    onClick={() => setOpenAdModal(false)}
                    className="btn btn-danger btn-sm"
                  >
                    Close
                  </button>
                </div>
                <iframe
                  src={adDocumentUrl}
                  width="100%"
                  height="100%"
                  title="Document"
                  style={{ border: "none", flexGrow: 1 }}
                ></iframe>
              </Box>
            </Modal>

            {/* Add / Edit Cashbook Modal */}
            <Modal open={openAddEditModal} onClose={() => setOpenAddEditModal(false)}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "500px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: "8px",
                }}
              >
                <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
                  <h4 className="m-0">{addEditMode === "edit" ? "Edit Cashbook" : "Add Cashbook"}</h4>
                  <button
                    onClick={() => setOpenAddEditModal(false)}
                    className="btn-close"
                    style={{ border: "none", background: "none", fontSize: "1.5rem", cursor: "pointer" }}
                  >
                    &times;
                  </button>
                </div>
                <form onSubmit={handleAddEditSubmit}>
                  <div className="mb-3">
                    <label className="form-label font-weight-bold">Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={cashbookForm.date}
                      onChange={(e) => setCashbookForm({ ...cashbookForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label font-weight-bold">Bank Ref.</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2026-2342"
                      value={cashbookForm.bank_ref}
                      onChange={(e) => setCashbookForm({ ...cashbookForm, bank_ref: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label font-weight-bold">Description of Receipt</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Description"
                      value={cashbookForm.description_on_receipt}
                      onChange={(e) => setCashbookForm({ ...cashbookForm, description_on_receipt: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label font-weight-bold">Receipt <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="0.00"
                      value={cashbookForm.receipt}
                      onChange={(e) => setCashbookForm({ ...cashbookForm, receipt: e.target.value })}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="button"
                      onClick={() => setOpenAddEditModal(false)}
                      className="btn btn-secondary me-2 mx-1"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save
                    </button>
                  </div>
                </form>
              </Box>
            </Modal>

            {/* View Splits Modal */}
            <Modal open={openViewSplitsModal} onClose={() => setOpenViewSplitsModal(false)}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "700px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: "12px",
                }}
              >
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <h4 className="m-0 text-primary font-weight-bold">View Splits</h4>
                  <button
                    onClick={() => setOpenViewSplitsModal(false)}
                    className="btn-close"
                    style={{ border: "none", background: "none", fontSize: "1.5rem", cursor: "pointer" }}
                  >
                    &times;
                  </button>
                </div>

                {selectedCashbook && (
                  <div className="alert alert-light border d-flex justify-content-between flex-wrap gap-2 mb-4 p-3 rounded">
                    <div><strong>Date:</strong> {new Date(selectedCashbook.date).toLocaleDateString("en-GB")}</div>
                    <div><strong>Bank Ref:</strong> {selectedCashbook.bank_ref || "-"}</div>
                    <div><strong>Total Receipt:</strong> {selectedCashbook.receipt}</div>
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead className="table-dark">
                      <tr>
                        <th>Split ID</th>
                        <th>Order Number</th>
                        <th>Allocated Amount</th>
                        <th>Created At</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewSplitsData.length > 0 ? (
                        viewSplitsData.map((split) => {
                          const orders = ordersPerRow[selectedCashbook?.id] || [];
                          const order = orders.find(o => o.order_ID === split.order_id);
                          const orderDisplay = order ? order.order_number : (split.order_number || split.order_id);
                          return (
                            <tr key={split.split_id}>
                              <td>{split.split_id}</td>
                              <td>{orderDisplay}</td>
                              <td>{split.allocated_amount}</td>
                              <td>{new Date(split.created_at).toLocaleString()}</td>
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm p-1 d-inline-flex align-items-center"
                                  onClick={() => handleDeleteIndividualSplit(split.split_id)}
                                  title="Delete Split"
                                >
                                  <BsTrash style={{ fontSize: "1.1rem" }} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-3">
                            No split records found for this cashbook.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end mt-4 pt-2 border-top">
                  <button
                    type="button"
                    onClick={() => setOpenViewSplitsModal(false)}
                    className="btn btn-secondary px-4"
                  >
                    Close
                  </button>
                </div>
              </Box>
            </Modal>

            {/* Add / Update Splits Modal */}
            <Modal open={openAddSplitsModal} onClose={() => setOpenAddSplitsModal(false)}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "650px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: "12px",
                }}
              >
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <h4 className="m-0 text-primary font-weight-bold">Manage Splits</h4>
                  <button
                    onClick={() => setOpenAddSplitsModal(false)}
                    className="btn-close"
                    style={{ border: "none", background: "none", fontSize: "1.5rem", cursor: "pointer" }}
                  >
                    &times;
                  </button>
                </div>

                {selectedCashbook && (
                  <div className="alert alert-light border d-flex justify-content-between flex-wrap gap-2 mb-4 p-3 rounded">
                    <div><strong>Date:</strong> {new Date(selectedCashbook.date).toLocaleDateString("en-GB")}</div>
                    <div><strong>Bank Ref:</strong> {selectedCashbook.bank_ref || "-"}</div>
                    <div><strong>Receipt Amount:</strong> {selectedCashbook.receipt}</div>
                  </div>
                )}

                <form onSubmit={handleSaveSplitsSubmit}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="m-0 font-weight-bold text-secondary">Split Allocations</h5>
                      <button
                        type="button"
                        onClick={handleAddSplitRow}
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        disabled={splitRows.length >= (ordersPerRow[selectedCashbook?.id]?.length || 0)}
                      >
                        <BsPlus style={{ fontSize: "1.2rem" }} /> Add Split Row
                      </button>
                    </div>

                    <div className="border rounded p-3 bg-light mb-3" style={{ maxHeight: "40vh", overflowY: "auto" }}>
                      {splitRows.map((row, index) => {
                        const availableOrders = ordersPerRow[selectedCashbook?.id] || [];
                        return (
                          <div key={index} className="row g-2 mb-3 align-items-center border-bottom pb-2">
                            <div className="col-md-6">
                              <label className="form-label small text-muted mb-1">Shipment Reference (Order)</label>
                              <select
                                className="form-select form-select-sm"
                                value={row.order_id}
                                onChange={(e) => handleSplitRowChange(index, "order_id", e.target.value)}
                                required
                              >
                                <option value="">Select Order...</option>
                                {availableOrders.map((order) => (
                                  <option key={order.order_ID} value={order.order_ID}>
                                    {order.order_number || `Order ID ${order.order_ID}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small text-muted mb-1">Allocated Amount</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control form-control-sm"
                                placeholder="0.00"
                                value={row.allocated_amount}
                                onChange={(e) => handleSplitRowChange(index, "allocated_amount", e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-2 text-end pt-3">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveSplitRow(index)}
                                disabled={splitRows.length === 1}
                              >
                                <BsTrash />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedCashbook && (
                    <div className="card p-3 mb-4 bg-light border">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Total Receipt Amount:</span>
                        <strong>{selectedCashbook.receipt}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Total Allocated:</span>
                        <strong className="text-primary">
                          {splitRows.reduce((sum, r) => sum + (parseFloat(r.allocated_amount) || 0), 0).toFixed(2)}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between border-top pt-1">
                        <span>Remaining Unallocated:</span>
                        <strong className={
                          (parseFloat(selectedCashbook.receipt) - splitRows.reduce((sum, r) => sum + (parseFloat(r.allocated_amount) || 0), 0)) < 0
                            ? "text-danger"
                            : "text-success"
                        }>
                          {(parseFloat(selectedCashbook.receipt) - splitRows.reduce((sum, r) => sum + (parseFloat(r.allocated_amount) || 0), 0)).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-end mt-4 pt-2 border-top">
                    <button
                      type="button"
                      onClick={() => setOpenAddSplitsModal(false)}
                      className="btn btn-secondary me-2 mx-1"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4">
                      Save Splits
                    </button>
                  </div>
                </form>
              </Box>
            </Modal>
            <ToastContainer />
          </div>
        </div>
      )}
    </>
  );
}
