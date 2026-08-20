import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Modal, Box } from "@mui/material";

const SearchableDropdown = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    const currentOption = options.find((opt) => String(opt.id) === String(value));
    if (currentOption) {
      setSearch(currentOption.document_number);
    } else {
      setSearch(value === "Select" ? "" : value || "");
    }
  }, [value, options]);

  const filteredOptions = options.filter((opt) =>
    opt.document_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} style={{ position: "relative", minWidth: "120px" }}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        style={{ height: "30px", padding: "0 6px", fontSize: "14px", width: "100%" }}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          if (e.target.value === "") {
            onChange("");
          }
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 9999,
            padding: 0,
            margin: "2px 0 0 0",
            listStyle: "none",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <li
                key={idx}
                style={{ padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearch(opt.document_number);
                  setIsOpen(false);
                  onChange(opt.id);
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8f9fa")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                {opt.document_number}
              </li>
            ))
          ) : (
            <li style={{ padding: "6px 12px", color: "#999", fontSize: "14px" }}>
              No results
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default function BillingTable() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [dropdownData, setDropdownData] = useState({});
  const [selectedDueDates, setSelectedDueDates] = useState({});
  const [searchdata, setSearchdata] = useState({
    search: "",
  });
  const [selectedInvoices, setSelectedInvoices] = useState({});
  const [pagenation, setPagenation] = useState({});
  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openAdModal, setOpenAdModal] = useState(false);
  const [adDocumentUrl, setAdDocumentUrl] = useState("");
  const [modalTitle, setModalTitle] = useState("AD Document");

  useEffect(() => {
    getTableData();
  }, []);

  const getTableData = async (page) => {
    setLoader(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}OrderInvoiceList?page=${page == undefined ? currentPage : page
        }`
      );
      const data = response.data.data || [];
      console.log(response.data);
      setTableData(response.data.data);
      setPagenation(response.data.pagination);
      setLoader(false);
      const uniqueOrderIDs = [...new Set(data.map((item) => item.order_ID))];
      if (uniqueOrderIDs.length > 0) {
        fetchDropdownData(uniqueOrderIDs);
      }
    } catch (error) {
      setLoader(false);
      console.error(
        "Error fetching table data:",
        error.response?.data || error.message
      );
    }
  };

  const fetchDropdownData = async (orderIDs) => {
    try {
      setLoader(true);
      const dropdownResponses = await Promise.all(
        orderIDs.map((orderID) =>
          axios.get(`${process.env.REACT_APP_BASE_URL}GetSageInvoiceDropdown`, {
            params: { order_ID: orderID },
          })
        )
      );
      const dropdownResults = {};
      orderIDs.forEach((orderID, index) => {
        dropdownResults[orderID] = dropdownResponses[index].data.data || [];
      });
      setLoader(false);
      setDropdownData(dropdownResults);
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
      setLoader(false);
    }
  };

  const handleDropdownChange = (field, value, item, index) => {
    const rowKey = item.invoice_id !== null ? item.invoice_id : `temp-${index}`;
    const updatedInvoice = {
      ...selectedInvoices[rowKey],
      [field]: value,
    };
    setSelectedInvoices((prev) => ({
      ...prev,
      [rowKey]: updatedInvoice,
    }));
    handleInvoiceSelection(item, updatedInvoice, rowKey);
  };

  const handleInvoiceSelection = (item, updatedInvoice, rowKey) => {
    const invoiceDetails = {
      invoice_id: item.invoice_id,
      date: item.created_at,
      transaction: updatedInvoice.transaction !== undefined ? updatedInvoice.transaction : item.transaction,
      order_id: item.order_ID,
      client_id: item.client_id,
      sage_invoice_id: updatedInvoice.sage_invoice_id !== undefined ? updatedInvoice.sage_invoice_id : item.sage_invoice_id,
      invoice_amt: item.invoice_amt,
      due_date: updatedInvoice.due_date !== undefined ? updatedInvoice.due_date : selectedDueDates[rowKey],
      payment: item.payment,
      invoice_currency:
        updatedInvoice.invoice_currency !== undefined ? updatedInvoice.invoice_currency : item.invoice_currency,
    };
    sendInvoiceDetails(invoiceDetails);
  };

  const sendInvoiceDetails = async (invoiceDetails) => {
    try {
      setLoader(true);
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}AddInvoiceDetails`,
        invoiceDetails
      );
      getTableData();
      setLoader(false);
      toast.success("Invoice details submitted successfully");
    } catch (error) {
      setLoader(false);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Unexpected error occurred";
      console.error(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (page) => {
    console.log(page);
    setCurrentPage(page);
    getTableData(page);
  };

  const totalPage = pagenation.pageSize;
  const startIndex = (currentPage - 1) * pagenation.pageSize;
  const endIndex = startIndex + pagenation.pageSize;
  const currentData = tableData.slice(startIndex, endIndex);
  const handleDueDateChange = (e, item, index) => {
    const rowKey = item.invoice_id !== null ? item.invoice_id : `temp-${index}`;
    const newDate = e.target.value;
    setSelectedDueDates((prev) => ({
      ...prev,
      [rowKey]: newDate,
    }));

    const updatedInvoice = {
      ...selectedInvoices[rowKey],
      invoice_id: item.invoice_id,
      due_date: newDate,
    };
    setSelectedInvoices((prev) => ({
      ...prev,
      [rowKey]: updatedInvoice,
    }));
    handleInvoiceSelection(item, updatedInvoice, rowKey);
  };

  const getAvailableOptions = (item) => {
    const selectedSageInvoiceIds = Object.values(selectedInvoices).map(
      (invoice) => invoice.sage_invoice_id
    );
    return (
      dropdownData[item.order_ID]?.filter(
        (option) => !selectedSageInvoiceIds.includes(option.id)
      ) || []
    );
  };

  const handlechnage = (e) => {
    const { name, value } = e.target;
    setSearchdata({ ...searchdata, [name]: value });
  };

  const hadleclick = async () => {
    setLoader(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}OrderInvoiceList?search=${searchdata.search}`
      );

      const data = response.data.data || [];

      console.log(response.data);

      // SET TABLE DATA
      setTableData(data);

      // PAGINATION
      setPagenation(response.data.pagination || {});

      // IF NO DATA
      if (data.length === 0) {
        toast.error("No Data Found");
      }

      // FETCH DROPDOWN DATA
      const uniqueOrderIDs = [
        ...new Set(data.map((item) => item.order_ID)),
      ];

      if (uniqueOrderIDs.length > 0) {
        fetchDropdownData(uniqueOrderIDs);
      }

      setLoader(false);
    } catch (error) {
      setLoader(false);

      console.error(
        "Error fetching table data:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };
  
  return (
    <>
      {loader ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Updating... Invoice may take some time</p>
        </div>
      ) : (
        <div className="wpWrapper">
          <div className="container-fluid manageFreight">
            <div>
              <div className="d-flex justify-content-between align-items-center my-3">
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary blueBtn"
                    onClick={() => navigate("/Admin/customer-balance-report")}
                  >
                    Customer Balance
                  </button>
                </div>
                <div className="d-flex searchManageFre">
                  <input
                    name="search"
                    placeholder="search..."
                    className="px-2 rounded"
                    onChange={handlechnage}
                  ></input>
                  <button className="mx-2 btn btn-secondary" onClick={hadleclick}>
                    search
                  </button>
                </div>
              </div>
              <div className="card-body">
                <table className="table  table-responsive table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transaction</th>
                      <th>Shipment Ref</th>
                      <th>Customer</th>
                      <th>Invoice Ref</th>
                      <th>Invoice Amount</th>
                      <th>Invoice (AD)</th>
                      <th>Due Date</th>
                      <th>Currency</th>
                      <th>Payment</th>
                      <th>Balance</th>
                      <th>Invoice (POP)</th>
                    </tr>
                  </thead>
                  {/* <tbody>
                    {tableData &&
                      tableData.length > 0 &&
                      tableData.map((item) => {
                        console.log(item);
                        return (
                          <>
                            <tr key={item.invoice_id}>
                              <td>
                                {new Date(item.date).toLocaleDateString(
                                  "en-GB"
                                ) == "01/01/1970"
                                  ? ""
                                  : new Date(item.date).toLocaleDateString(
                                      "en-GB"
                                    )}
                              </td>
                              <td>
                                <select
                                  value={
                                    selectedInvoices[item.invoice_id]
                                      ?.transaction || item.transaction
                                  }
                                  onChange={(e) =>
                                    handleDropdownChange(
                                      "transaction",
                                      e.target.value,
                                      item
                                    )
                                  }
                                >
                                  <option value="Select">Select</option>
                                  {item.invoice_amt > 0 ? (
                                    <option value="Invoice">INV</option>
                                  ) : (
                                    ""
                                  )}
                                  {item.invoice_amt < 0 ? (
                                    <option value="Credit Note">CRN</option>
                                  ) : (
                                    ""
                                  )}
                                  {item.invoice_amt > 0 ? (
                                    <option value="Adjustment">ADJ</option>
                                  ) : (
                                    ""
                                  )}
                                  {item.invoice_amt < 0 ? (
                                    <option value="Write-off">WO</option>
                                  ) : (
                                    ""
                                  )}
                                </select>
                              </td>
                              <td>{item.order_number || "N/A"}</td>
                              <td>{item.client_name || "N/A"}</td>
                              <td>
                                <select
                                  value={
                                    selectedInvoices[item.invoice_id]
                                      ?.sage_invoice_id || item.sage_invoice_id
                                  }
                                  onChange={(e) =>
                                    handleDropdownChange(
                                      "sage_invoice_id",
                                      e.target.value,
                                      item
                                    )
                                  }
                                >
                                  <option value="Select">Select</option>
                                  {getAvailableOptions(item).map(
                                    (option, index) => (
                                      <option key={index} value={option.id}>
                                        {option.document_number}
                                      </option>
                                    )
                                  )}
                                </select>
                              </td>
                              <td>{item.invoice_amt}</td>
                              <td>
                                {item.invoice_id === null ? (
                                  ""
                                ) : (
                                  <input
                                    type="date"
                                    value={
                                      selectedDueDates[item.invoice_id] ||
                                      (item.due_date
                                        ? new Date(item.due_date)
                                            .toISOString()
                                            .split("T")[0]
                                        : "")
                                    }
                                    onChange={(e) =>
                                      handleDueDateChange(e, item)
                                    }
                                  />
                                )}
                              </td>
                              <td>
                                {item.invoice_id === null ? (
                                  ""
                                ) : (
                                  <select
                                    value={
                                      selectedInvoices[item.invoice_id]
                                        ?.invoice_currency ||
                                      item.invoice_currency
                                    }
                                    onChange={(e) =>
                                      handleDropdownChange(
                                        "invoice_currency",
                                        e.target.value,
                                        item
                                      )
                                    }
                                  >
                                    <option value="Select">Select</option>
                                    <option value="ZAR">ZAR</option>
                                    <option value="USD">USD</option>
                                    <option value="Euro">Euro</option>
                                    <option value="GBP">GBP</option>
                                    <option value="KWA">KWA</option>
                                  </select>
                                )}
                              </td>
                              <td>{item.payment}</td>
                              <td>
                                {/* {item.balance === 0
                                  ? item.invoice_amt
                                  : item.balance} */}
                  {/* {item.balance}
                              </td>
                            </tr>
                          </>
                        );
                      })}
                  </tbody> */}
                  <tbody>
                    {tableData && tableData.length > 0 ? (
                      tableData.map((item, index) => {
                        const rowKey = item.invoice_id !== null ? item.invoice_id : `temp-${index}`;
                        return (
                          <tr key={rowKey}>
                            <td>
                              {new Date(item.date).toLocaleDateString(
                                "en-GB"
                              ) == "01/01/1970"
                                ? ""
                                : new Date(item.date).toLocaleDateString(
                                  "en-GB"
                                )}
                            </td>

                            <td>
                              <select
                                value={
                                  selectedInvoices[rowKey]?.transaction !== undefined
                                    ? selectedInvoices[rowKey].transaction
                                    : item.transaction
                                }
                                onChange={(e) =>
                                  handleDropdownChange(
                                    "transaction",
                                    e.target.value,
                                    item,
                                    index
                                  )
                                }
                              >
                                <option value="Select">Select</option>

                                {item.invoice_amt > 0 && (
                                  <>
                                    <option value="Invoice">INV</option>
                                    <option value="Adjustment">
                                      ADJ
                                    </option>
                                  </>
                                )}

                                {item.invoice_amt < 0 && (
                                  <>
                                    <option value="Credit Note">
                                      CRN
                                    </option>
                                    <option value="Write-off">
                                      WO
                                    </option>
                                  </>
                                )}
                              </select>
                            </td>

                            <td>{item.order_number || "N/A"}</td>

                            <td>{item.client_name || "N/A"}</td>

                            <td>
                              <SearchableDropdown
                                options={getAvailableOptions(item)}
                                value={
                                  selectedInvoices[rowKey]?.sage_invoice_id !== undefined
                                    ? selectedInvoices[rowKey].sage_invoice_id
                                    : item.sage_invoice_id
                                }
                                placeholder="Select Invoice"
                                onChange={(valueToSet) => {
                                  handleDropdownChange(
                                    "sage_invoice_id",
                                    valueToSet,
                                    item,
                                    index
                                  );
                                }}
                              />
                            </td>

                            <td>{item.invoice_amt}</td>

                            <td className="text-center">
                              {item.freight_invoice_docs && item.freight_invoice_docs.filter((doc) => doc.document_name === "Invoice (AD)").length > 0 ? (
                                item.freight_invoice_docs
                                  .filter((doc) => doc.document_name === "Invoice (AD)")
                                  .map((doc) => (
                                    <i
                                      key={doc.id}
                                      className="fi fi-rr-document mx-1"
                                      style={{ cursor: "pointer", fontSize: "1.2rem", color: "#007bff" }}
                                      title="View AD Document"
                                      onClick={() => {
                                        setModalTitle("Invoice (AD)");
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
                              {item.invoice_id === null ? (
                                ""
                              ) : (
                                <input
                                  type="date"
                                  value={
                                    selectedDueDates[rowKey] ||
                                    (item.due_date
                                      ? new Date(item.due_date)
                                        .toISOString()
                                        .split("T")[0]
                                      : "")
                                  }
                                  onChange={(e) =>
                                    handleDueDateChange(e, item, index)
                                  }
                                />
                              )}
                            </td>

                            <td>
                              {item.invoice_id === null ? (
                                ""
                              ) : (
                                <select
                                  value={
                                    selectedInvoices[rowKey]?.invoice_currency !== undefined
                                      ? selectedInvoices[rowKey].invoice_currency
                                      : item.invoice_currency
                                  }
                                  onChange={(e) =>
                                    handleDropdownChange(
                                      "invoice_currency",
                                      e.target.value,
                                      item,
                                      index
                                    )
                                  }
                                >
                                  <option value="Select">Select</option>
                                  <option value="ZAR">ZAR</option>
                                  <option value="USD">USD</option>
                                  <option value="Euro">Euro</option>
                                  <option value="GBP">GBP</option>
                                  <option value="KWA">KWA</option>
                                </select>
                              )}
                            </td>

                            <td>{item.payment}</td>

                            <td>{item.balance}</td>
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
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center">
                          No Data Found
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
                  <span className="mx-2">{`Page ${currentPage} of ${pagenation.totalPages}`}</span>
                  <button
                    disabled={currentPage === pagenation.totalPages}
                    className="bg_page"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <i className="fi fi-rr-angle-small-right page_icon"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                title="AD Document"
                style={{ border: "none", flexGrow: 1 }}
              ></iframe>
            </Box>
          </Modal>
          
        </div>
      )}
    </>
  );
}