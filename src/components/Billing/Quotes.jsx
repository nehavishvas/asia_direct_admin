import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ViewQuotesInvoice from "./ViewQuotesInvoice";

const Quotes = () => {
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [search, setSearch] = useState("");
    const [printItem, setPrintItem] = useState(null);
    const limit = 10;
    const navigate = useNavigate();

    useEffect(() => {
        getQuotes(currentPage);
    }, [currentPage]);

    const getQuotes = async (pageNo = 1) => {
        setLoader(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}GetFreightQuoteEstimateList?page=${pageNo}&limit=${limit}&search=${search}`
            );
            console.log(response.data);
            setData(response.data.data || []);
            setTotalPage(
                response.data.pagination?.total_pages || 1
            );
            setCurrentPage(
                response.data.pagination?.current_page || 1
            );
            setLoader(false);
        } catch (error) {
            setLoader(false);
            console.error(
                "Error fetching quotes:",
                error.message
            );
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        getQuotes(1);
    };

    const handlePageChange = (page) => {
        console.log("Selected Page =>", page);
        setCurrentPage(page);
    };

    const naviagetpage = () => {
        navigate("/Admin/addquotesinvoice");
    };

    const deletewarehouse = async (freight_quote_estimate_id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this quote estimate?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });
        if (result.isConfirmed) {
             setLoader(true);
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_BASE_URL}deleteFreightQuoteEstimate`, {
                    freight_quote_estimate_id: freight_quote_estimate_id
                }
                );
                 setLoader(false);
                if (response.data.success) {
                    getQuotes(currentPage);
                    Swal.fire({
                        icon: "success",
                        title: "Deleted!",
                        text: "Quote invoice deleted successfully.",
                        confirmButtonColor: "#3085d6",
                    });
                } else {
                    toast.error(response.data.message || "Failed to delete quote invoice.");
                }
            } catch (error) {
                console.error(error);
                setLoader(false);
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
        navigate("/Admin/addquotesinvoice", { state: { copyInvoiceData: item } });
    };

    const handleCreateInvoice = async (freight_quote_estimate_id) => {
        try {
            setLoader(true);
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}createQuoteInvoice`,
                { freight_quote_estimate_id }
            );
            setLoader(false);
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Invoice created successfully");
                getQuotes(currentPage);
            } else {
                toast.error(response.data.message || "Failed to create invoice");
            }
        } catch (error) {
            setLoader(false);
            console.error("Error creating invoice:", error);
            toast.error(error.response?.data?.message || "Something went wrong while creating invoice");
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
                    <div className="container-fluid">
                        <div className="d-flex justify-content-between align-items-center mb-3 manageFreight">
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-secondary"
                                    onClick={naviagetpage}
                                >
                                    Add Quote Estimation
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate("/Admin/customer-quotes-report")}
                                >
                                    Customer Quotes Report
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
                                        <th>Freight Number</th>
                                        <th>Customer Invoice Number</th>
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
                                                <tr key={item.freight_quote_estimate_id}>
                                                    <td>{item.reference_no || "-"}</td>
                                                    <td>{item.client_name || item.supplier_name || "-"}</td>
                                                    <td>{item.freight_number || "-"}</td>
                                                    <td>{item.customer_invoice_no || "-"}</td>
                                                    <td>
                                                        {item.inv_date
                                                            ? new Date(item.inv_date).toLocaleDateString("en-GB")
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
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => navigate("/Admin/viewquotesinvoice", { state: { item } })}
                                                                    >
                                                                        View
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => setPrintItem(item)}
                                                                    >
                                                                        Print
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => navigate("/Admin/editquotesinvoice", { state: { item } })}
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
                                                                        onClick={() => deletewarehouse(item.freight_quote_estimate_id)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => handleCreateInvoice(item.freight_quote_estimate_id)}
                                                                    >
                                                                        Create Invoice
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
                        <ViewQuotesInvoice
                            hiddenPrintItem={printItem}
                            onPrintComplete={() => setPrintItem(null)}
                        />
                    )}
                    <ToastContainer />
                </div>
            )}
        </>
    )
}

export default Quotes;