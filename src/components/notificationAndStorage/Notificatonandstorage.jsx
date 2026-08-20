import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export default function Notificatonandstorage() {
  const pageSize = 10;
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredData = data.filter((item) =>
    (item.freight_number?.toLowerCase() || "").includes(
      searchQuery.toLowerCase()
    )
  );
  const totalPage = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentdata = filteredData.slice(startIndex, endIndex);
  useEffect(() => {
    getdata();
  }, []);
  const getdata = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}GetAllFreightDocs`
      );
      setData(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };
    const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="">
          <div className="card-body d-flex justify-content-end searchManageFre">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="form-control w-25"
              placeholder="Search"
            />
          </div>
          <div className="row manageFreight">
            <div className="table-responsive mt-4">
              <table className="table table-striped tableICon">
                <thead>
                  <tr>
                    <th>SR NO.</th>
                    <th>Freight Number</th>
                    <th>Client Name</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {currentdata.length > 0 ? (
                    currentdata.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.freight_number}</td>
                        <td>{item.client_name}</td>
                        <td>
                          <Link to={`/Admin/viewdocument/${item.id}`}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="text-center d-flex justify-content-end align-items-center">
                <button
                  disabled={currentPage === 1}
                  className="bg_page"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <i className="fi fi-rr-angle-small-left page_icon"></i>
                </button>
                <span className="mx-2">{`Page ${currentPage} of ${
                  totalPage || 1
                }`}</span>
                <button
                  disabled={currentPage === totalPage || totalPage === 0}
                  className="bg_page"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <i className="fi fi-rr-angle-small-right page_icon"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
