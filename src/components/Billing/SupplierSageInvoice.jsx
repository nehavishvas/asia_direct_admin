import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Viewsupplierinvoice from "./Viewsupplierinvoice";

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

export default function SupplierSageInvoice() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();
  const [printItem, setPrintItem] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getClients(currentPage);
  }, [currentPage]);

  const getClients = async (pageNo = 1) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}getAllSupplierShipmentInvoices?page=${pageNo}&limit=${limit}&search=${search}`
      );
      console.log(response.data);
      const fetchedData = response.data.data || [];
      const normalizedData = fetchedData.map((item) => ({
        ...item,
        supplier_invoice_id: item.supplier_shipment_invoice_id,
        invoice_total: item.sumof_vatincl !== undefined ? item.sumof_vatincl : item.invoice_total,
        supplier_invoice_no: item.customer_invoice_no || item.supplier_invoice_no,
      }));
      setData(normalizedData);
      setTotalPage(
        response.data.pagination?.totalPages || 1
      );
    } catch (error) {
      console.error(
        "Error fetching clients:",
        error.message
      );
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getClients(1);
  };

  const handlePageChange = (page) => {
    console.log("Selected Page =>", page);
    setCurrentPage(page);
  };

  const naviagetpage = () => {
    navigate("/Admin/addsupplierinvoice");
  };

  const deletewarehouse = async (id) => {
    console.log(id);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this invoice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}deleteSupplierShipmentInvoice`,
          { supplier_shipment_invoice_id: id }
        );
        if (response.data.success) {
          // REFRESH CURRENT PAGE
          getClients(currentPage);

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Invoice deleted successfully.",
            confirmButtonColor: "#3085d6",
          });
        }
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error?.response?.data?.message ||
            "Something went wrong!",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const AutoEditde = (item) => {
    navigate("/Admin/editsupplierinvoiceedit", {
      state: { item },
    });
  };

  const handleCopyInvoice = async (item) => {
    console.log(item)
    navigate("/Admin/addsupplierinvoice", { state: { copyInvoiceData: item } })
  };

  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-3 manageFreight">
          <button
            className="btn btn-secondary"
            onClick={naviagetpage}
          >
            Add New Invoice
          </button>
          <div className="d-flex align-items-center gap-2 searchManageFre">
            <input
              name="search"
              value={search}
              className="form-control"
              placeholder="Search..."
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button className="blueBtn" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
        <div className="table-responsive tableResFixed mt-4">
          <table className="table table-striped tableICon">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Supplier Name</th>
                <th>Waybill</th>
                <th>Sup Invoice Number</th>
                <th>Inv Date</th>
                <th>Due Date</th>
                <th>Currency</th>
                <th>Total</th>
                <th>Amount Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data &&
                data.length > 0 ? (
                data.map((item) => {
                  return (
                    <tr key={item.supplier_invoice_id}>
                      <td>{item.reference_no || "-"}</td>
                      <td>
                        {item.supplier_name}
                      </td>
                      <td>{item.waybill}</td>
                      <td>{item.supplier_invoice_no || "-"}</td>
                      <td>
                        {item?.supplier_invoice_date
                          ? new Date(item.supplier_invoice_date).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td>
                        {item?.due_date
                          ? new Date(item.due_date).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td>{item.final_base_currency || "-"}</td>
                      <td>
                        {formatValue(item.invoice_total, 2)}
                      </td>
                      <td>{formatValue(item.invoice_total, 2)}</td>
                      <td>{item.status}</td>
                      <td>
                        <div className="dropdown">
                          <div
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            <BsThreeDotsVertical />
                          </div>
                          <ul className="dropdown-menu">
                            <li>
                              <button type="button" className="dropdown-item" onClick={() => navigate("/Admin/view-supplier-invoice", { state: { item } })}>
                                View
                              </button>
                            </li>
                            <li>
                              <button type="button" className="dropdown-item" onClick={() => setPrintItem(item)}>
                                Print
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => AutoEditde(item)}
                              >
                                Edit
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => handleCopyInvoice(item)}
                              >
                                Copy
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                className="dropdown-item text-danger"
                                onClick={() =>
                                  deletewarehouse(item.supplier_invoice_id)
                                }
                              >
                                Delete
                              </button>
                            </li>
                            <li>
                              <button type="button" className="dropdown-item">
                                Create Supplier Adjust
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                      {/* <td>
                        <AiFillDelete
                          onClick={() => {
                            deletewarehouse(
                              item.supplier_invoice_id
                            );
                          }}
                          style={{
                            color:
                              "rgb(212, 69, 25)",
                            marginRight: "10px",
                            width: "20px",
                            height: "15px",
                            cursor: "pointer",
                          }}
                        />
                        <FaEdit
                          onClick={() => {
                            AutoEditde(item);
                          }}
                          style={{
                            color:
                              "rgb(73, 202, 80)",
                            marginRight: "10px",
                            width: "20px",
                            height: "15px",
                            cursor: "pointer",
                          }}
                        />
                      </td> */}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center"
                  >
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="text-center d-flex justify-content-end align-items-center mt-3">
            <button
              disabled={currentPage === 1}
              className="bg_page"
              onClick={() =>
                handlePageChange(currentPage - 1)
              }
            >
              <i className="fi fi-rr-angle-small-left page_icon"></i>
            </button>
            <span className="mx-3">
              {`Page ${currentPage} of ${totalPage}`}
            </span>
            <button
              disabled={currentPage === totalPage}
              className="bg_page"
              onClick={() =>
                handlePageChange(currentPage + 1)
              }
            >
              <i className="fi fi-rr-angle-small-right page_icon"></i>
            </button>
          </div>
        </div>
      </div>
      {printItem && <Viewsupplierinvoice hiddenPrintItem={printItem} onPrintComplete={() => setPrintItem(null)} />}
      
    </div>
  );
}