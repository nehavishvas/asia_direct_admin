import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ViewNewFreightQuoteInvoice from "./ViewNewFreightQuoteInvoice";
import ReportFilterModal from "./ReportFilterModal";

const Invoices = () => {
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [search, setSearch] = useState("");
    const [printItem, setPrintItem] = useState(null);
    const [openReportModal, setOpenReportModal] = useState(false);
    const limit = 10;
    const navigate = useNavigate();

    useEffect(() => {
        getInvoices(currentPage);
    }, [currentPage]);

    const getInvoices = async (pageNo = 1) => {
        setLoader(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}getAllNewFreightQuoteInvoices?page=${pageNo}&limit=${limit}&search=${search}`
            );
            console.log(response.data);
            setData(response.data.data || []);
            setTotalPage(
                response.data.pagination?.totalPages || response.data.pagination?.total_pages || 1
            );
            setCurrentPage(
                response.data.pagination?.currentPage || response.data.pagination?.current_page || 1
            );
            setLoader(false);
        } catch (error) {
            setLoader(false);
            console.error(
                "Error fetching invoices:",
                error.message
            );
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        getInvoices(1);
    };

    const handlePageChange = (page) => {
        console.log("Selected Page =>", page);
        setCurrentPage(page);
    };

    const naviagetpage = () => {
        navigate("/Admin/addnewfreightquoteinvoice");
    };

    const deleteInvoice = async (quote_invoice_id) => {
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
                    `${process.env.REACT_APP_BASE_URL}deleteNewFreightQuoteInvoice/${quote_invoice_id}`
                );
                if (response.data.success) {
                    getInvoices(currentPage);
                    Swal.fire({
                        icon: "success",
                        title: "Deleted!",
                        text: "Invoice deleted successfully.",
                        confirmButtonColor: "#3085d6",
                    });
                } else {
                    toast.error(response.data.message || "Failed to delete invoice.");
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error?.response?.data?.message || "Something went wrong!",
                    confirmButtonColor: "#d33",
                });
            }
        }
    };

    const handleCopyInvoice = (item) => {
        navigate("/Admin/addnewfreightquoteinvoice", { state: { copyInvoiceData: item } });
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
                    <div className="container-fluid">
                        <div className="d-flex justify-content-between align-items-center mb-3 manageFreight">
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-secondary"
                                    onClick={naviagetpage}
                                >
                                    Add Quote Invoice
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setOpenReportModal(true)}
                                >
                                    Customer Invoices Report
                                </button>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    name="search"
                                    value={search}
                                    className="form-control"
                                    placeholder="Search Reference/Customer..."
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
                                        <th>Customer Name</th>
                                        <th>Freight / Order Number</th>
                                        {/* <th>Customer Invoice No.</th> */}
                                        <th>Customer Ref</th>
                                        <th>Inv Date</th>
                                        <th>Country</th>
                                        <th>Currency</th>
                                        <th>Total</th>
                                        <th>Amount Due</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length > 0 ? (
                                        data.map((item) => {
                                            return (
                                                <tr key={item.quote_invoice_id}>
                                                    <td>{item.reference_no || "-"}</td>
                                                    <td>{item.client_name || "-"}</td>
                                                    <td>
                                                        {[item.freight_number, item.order_number]
                                                            .filter(Boolean)
                                                            .join(" / ") || "-"}
                                                    </td>
                                                    {/* <td>{item.customer_invoice_no || "-"} </td> */}
                                                    <td>{item.customer_ref || "-"}</td>
                                                    <td>
                                                        {item.inv_date || item.inv_date
                                                            ? new Date(item.inv_date || item.inv_date).toLocaleDateString("en-GB")
                                                            : "-"}
                                                    </td>
                                                    <td>{item.invoice_for_country || "-"}</td>
                                                    <td>{item.final_base_currency || "-"}</td>
                                                    <td>{item.sumof_vatincl !== undefined ? item.sumof_vatincl : "0.00"}</td>
                                                    <td>{item.sumof_vatincl !== undefined ? item.sumof_vatincl : "0.00"}</td>
                                                    <td>{item.status || "-"}</td>
                                                    <td>
                                                        <div className="dropdown">
                                                            <div type="button" data-bs-toggle="dropdown">
                                                                <BsThreeDotsVertical />
                                                            </div>
                                                            <ul className="dropdown-menu">
                                                                <li>
                                                                    <button type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => navigate("/Admin/viewnewfreightquoteinvoice", { state: { item } })}
                                                                    >
                                                                        View
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => setPrintItem(item)}
                                                                    >
                                                                        Print
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => navigate("/Admin/editnewfreightquoteinvoice", { state: { item } })}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button type="button"
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
                                                                        onClick={() => deleteInvoice(item.quote_invoice_id)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button type="button"
                                                                        className="dropdown-item">
                                                                        Create Supplier Adjust
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="10"
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
                    {printItem && (
                        <ViewNewFreightQuoteInvoice
                            hiddenPrintItem={printItem}
                            onPrintComplete={() => setPrintItem(null)}
                        />
                    )}
                    <ReportFilterModal
                        open={openReportModal}
                        onClose={() => setOpenReportModal(false)}
                        reportType="invoices"
                    />
                    <ToastContainer />
                </div>
            )}
        </>
    );
};

export default Invoices;
