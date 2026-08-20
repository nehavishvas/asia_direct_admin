import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

export default function ReleasedDashboadrs() {
  const [data, setData] = useState([]);

  // current page
  const [currentPage, setCurrentPage] = useState(1);

  // total pages from API
  const [totalPages, setTotalPages] = useState(1);

  // limit per page
  const limit = 10;

  // ================= GET DATA =================

useEffect(() => {
  getdatatable(currentPage);
}, [currentPage]);

const getdatatable = async (pageNo) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}GetRealeseDashboard?page=${pageNo}&limit=${limit}`
    );

    console.log(response.data);

    setData([...response.data.data]);

    setTotalPages(response.data.totalPages || 1);

  } catch (error) {
    console.log(error);
  }
};

const handlePageChange = (event, value) => {
  setCurrentPage(value);
};

  // ================= DROPDOWN =================

  const handlechangedropdown = (e, item2) => {
    const data1 = e.target.value;

    handlehitapi(data1, item2);
  };

  // ================= UPDATE API =================

  const handlehitapi = async (data1, item2) => {
    try {
      const datapost = {
        order_id: item2.order_id,
        invoice_id: item2.id,
        cargo_inspection: data1,
        release_instruction: item2.release_instruction,
        Status: data1 === "Confirmed" ? "Close" : "Open",
        realese_id: item2.realese_id,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}ManageRealeseDashboard`,
        datapost
      );

      // refresh current page
      getdatatable(currentPage);

      if (response.data.status === 200) {
        toast.success("Data Updated Successfully");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="row">
          {/* HEADER */}

          <div className="row manageFreight">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="freight_hd">
                    Released Dashboard
                  </h4>
                </div>

                <div className="d-flex align-items-center justify-content-end">
                  <div className="me-2 searchManageFre">
                    <input
                      className="py-1 rounded ps-1"
                      type="text"
                      placeholder="Search"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}

          <div className="table-responsive mt-3">
            <table className="table table-striped tableICon">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer Name</th>
                  <th>Clearing Status</th>
                  <th>Cargo Inspection</th>
                  <th>Payment</th>
                  <th>Release Instruction</th>
                  <th>Delivery</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody style={{ border: "none" }}>
                {data &&
                  data.length > 0 &&
                  data.map((item, index) => {
                    return (
                      <tr
                        className="border-bottom"
                        key={index}
                      >
                        <td>{item.order_number}</td>

                        <td>{item.order_user_name}</td>

                        <td>{item.clearance_status}</td>

                        <td>
                          <select
                            onChange={(e) => {
                              handlechangedropdown(e, item);
                            }}
                            value={item.cargo_inspection}
                            name="status"
                          >
                            <option value="">
                              Select...
                            </option>

                            <option value="Inprogress">
                              In Progress
                            </option>

                            <option value="Querry">
                              Querry
                            </option>

                            <option value="Confirmed">
                              Confirmed
                            </option>
                          </select>
                        </td>

                        <td>{item.status}</td>

                        <td>
                          {item.release_instruction}
                        </td>

                        <td>{item.order_status}</td>

                        <td>
                          {item.cargo_inspection ===
                          "Confirmed"
                            ? "Close"
                            : "Open"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

            {/* PAGINATION */}

<div className="text-center d-flex justify-content-end align-items-center mt-3">

  {/* PREVIOUS BUTTON */}

  <button
    disabled={currentPage === 1}
    className="bg_page"
    onClick={() => setCurrentPage(currentPage - 1)}
  >
    <i className="fi fi-rr-angle-small-left page_icon"></i>
  </button>

  {/* PAGE TEXT */}

  <span className="mx-2">
    {`Page ${currentPage} of ${totalPages}`}
  </span>

  {/* NEXT BUTTON */}

  <button
    disabled={currentPage === totalPages}
    className="bg_page"
    onClick={() => setCurrentPage(currentPage + 1)}
  >
    <i className="fi fi-rr-angle-small-right page_icon"></i>
  </button>
</div>

          
        </div>
      </div>
    </div>
  );
}