import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiFillDelete } from "react-icons/ai";
const pageSize = 10;
export default function Contactus() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const getContactList = (page = 1, search = "") => {
    setLoader(true);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}getContactUs`, {
        page: page,
        limit: pageSize,
        search: search,
      })
      .then((response) => {
        setLoader(false);
        setData(response.data.data || []);
        setTotalPages(response.data.total_pages || 1);
      })
      .catch((error) => {
        setLoader(false);
        console.log(error.response?.data?.message || error.message);
        toast.error("Failed to fetch contact data.");
      });
  };
  useEffect(() => {
    const delay = setTimeout(() => {
      getContactList(currentPage, search);
    }, 400); // debounce
    return () => clearTimeout(delay);
  }, [currentPage, search]);
  const deleteContact = (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    axios
      .post(`${process.env.REACT_APP_BASE_URL}DeleteContactUs`, { id })
      .then((response) => {
        toast.success(response.data.message);
        getContactList(currentPage, search); // refresh
      })
      .catch((error) => {
        console.log(error.response?.data);
        toast.error("Failed to delete record");
      });
  };
  return (
    <>
      {loader ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Loading... Please wait</p>
        </div>
      ) : (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="row manageFreight">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="freight_hd">Contact Us Enquiries</h4>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="form-control w-25"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1); // reset page
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="table-responsive mt-3">
              <table className="table table-striped tableICon">
                <thead>
                  <tr>
                    <th>Sr.No.</th>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Email</th>
                    <th>Phone No</th>
                    <th>Subject</th>
                    <th>Nature of Enquiry</th>
                    <th>Message</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.length > 0 ? (
                    data.map((item, index) => (
                      <tr key={item.id}>
                        {/* ✅ Correct serial number */}
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>{item.name || "-"}</td>
                        <td>{item.country || "-"}</td>
                        <td>{item.email || "-"}</td>
                        <td>{item.phone_no || "-"}</td>
                        <td>{item.subject || "-"}</td>
                        <td>{item.nature_of_enq || "-"}</td>
                        <td>{item.message || "-"}</td>
                        <td>
                          {/* <FaEdit
                            style={{
                              color: "#1b2245",
                              marginRight: "10px",
                              opacity: 0.5,
                            }}
                          /> */}
                          <AiFillDelete
                            onClick={() => deleteContact(item.id)}
                            style={{
                              color: "red",
                              cursor: "pointer",
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
                {totalPages > 1 && (
                  <div className="text-end d-flex justify-content-end align-items-center">
                    <button
                      disabled={currentPage === 1}
                      className="bg_page"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      <i class="fi fi-rr-angle-small-left page_icon"></i>
                    </button>
                    <span className="mx-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      className="bg_page"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      <i class="fi fi-rr-angle-small-right page_icon"></i>
                    </button>
                  </div>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
      
    </>
  );
}
