import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomPagination from "../components/common/CustomPagination";
const pageSize = 10;
export default function ClientKpiModule() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [countruies, setCountruies] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagenationData, setPagenationData] = useState(1);
  // ---------------- FETCH DATA ----------------
 const getdata = async (page = 1, search = "") => {
  try {
    setLoader(true);

    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}ClientKPIModule`,
      {
        params: {
          page: page,
          limit: pageSize,
          search: search,
        },
      }
    );

    console.log(response.data.data);

    setData(response.data.data);
    setPagenationData(response.data.pagination);

  } catch (error) {
    toast.error("Error fetching suppliers");
  } finally {
    setLoader(false);
  }
};

useEffect(() => {
  getdata(currentPage, searchQuery);
}, [currentPage, searchQuery]);

const totalPages = pagenationData?.totalPages || 1;
  const getcountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        setCountruies(response.data.data);
      })
      .catch(() => {
        toast.error("Country fetch failed");
      });
  };
  useEffect(() => {
    getcountry();
  }, []);
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    getdata(1, value); 
  };
  return (
      <>
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="d-flex justify-content-between my-3">
              <h4>Client Kpi</h4>
              <div className="d-flex searchManageFre">
                <input
                  type="text"
                  placeholder="Search"
                  className="px-2 py-1"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
            {/* ---------------- TABLE ---------------- */}
            {loader ? (
              <div className="loader-container">
                <div className="loader"></div>
                <p>Loading...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Sr.No.</th>
                      <th> Name</th>
                      <th>Freight</th>
                      <th>Orders</th>
                      <th>Delivered Order</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index}>
                       <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>{item.full_name}</td>
                        <td>{item.total_freight}</td>
                        <td>{item.total_orders}</td>
                        <td>{item.total_delivered}</td>
                        <td>{item.total_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    getdata(page, searchQuery);
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
      </>
  );
}
