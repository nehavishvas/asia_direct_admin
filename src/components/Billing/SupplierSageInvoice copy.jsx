import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Viewsupplierinvoice from "./Viewsupplierinvoice";

export default function SupplierSageInvoice() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();
  const [printItem, setPrintItem] = useState(null);

  useEffect(() => {
    getClients(currentPage);
  }, [currentPage]);

  const getClients = async (pageNo = 1) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}getAllSupplierInvoices?page=${pageNo}&limit=${limit}`
      );
      console.log(response.data);
      setData(response.data.data || []);
      setTotalPage(
        Math.ceil((response.data.total || 1) / limit)
      );
    } catch (error) {
      console.error(
        "Error fetching clients:",
        error.message
      );
    }
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
          `${process.env.REACT_APP_BASE_URL}deleteSupplierInvoice/${id}`
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
        <button
          className="btn btn-secondary"
          onClick={naviagetpage}
        >
          Add New Invoice
        </button>
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
                        {new Date(
                          item?.supplier_invoice_date,
                        ).toLocaleDateString("en-GB") || "-"}
                      </td>
                      <td>{new Date(
                          item?.due_date,
                        ).toLocaleDateString("en-GB") || "-"}</td>
                      <td>{item.final_base_currency || "-"}</td>
                      <td>
                        {item.invoice_total}
                      </td>
                      <td>{item.invoice_total}</td>
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