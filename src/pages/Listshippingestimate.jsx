import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
const pageSize = 5;
export default function Listshippingestimate() {
  const navigate = useNavigate();
  const [datata, setDatata] = useState();
  const [listdata, setListdata] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const handleclickurl = (id) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-estimate-details`, {
        estimate_id: id,
      })
      .then((response) => {
        setDatata(response.data.data);
        navigate("/Admin/download_url", { state: response.data.data });
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}shipestimate-list`)
      .then((response) => {
        setListdata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = listdata.filter((item) => {
    console.log(item);
    return (
      item.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.freight_agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.incoterm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.freight.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.freight_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredData.slice(startIndex, endIndex);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="wpWrapper">
      <div className="container-fluid" style={{ height: "89vh" }}>
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between">
              <h4 className="freight_hd">Shipping estimate list</h4>
              <input placeholder="Search" type="text" class="px-2 py-1 rounded" value={searchQuery} onChange={handleSearch} />
            </div>
          </div>
        </div>
        <div className="card mt-3">
          <div className="card-body">
            <div style={{ overflowX: "auto" }}>
              <div className="table-responsive mt-2">
                <table className="table table-striped tableICon">
                  {/* <thead>
                                        <tr>
                                            <th scope="col">Sr.No.</th>
                                            <th scope="col">Serial Number</th>
                                            <th scope="col">Freight Number</th>
                                            <th scope="col">Freight</th>
                                            <th scope="col">Currency</th>
                                            <th scope="col">Freight Agent</th>
                                            <th scope="col">Dimension</th>
                                            <th scope="col">Export</th>
                                        </tr>
                                    </thead> */}
                  <tbody>
                    {currentData &&
                      currentData.length > 0 &&
                      currentData.map((item, index) => {
                        console.log(item);
                        return (
                          <>
                            <tr key={index}>
                              <td className="list_bd">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    <p className="client_nm">
                                      {item.clientName}
                                    </p>
                                    <p className="fright_no mx-2">
                                      {item.freight_number}
                                    </p>
                                  </div>
                                  <div className="">
                                    <p className="port_date">
                                      {new Date(
                                        item.created_at
                                      ).toLocaleDateString("en-GB")}
                                    </p>
                                  </div>
                                </div>
                                <div className="container-fluid">
                                  <div className="row">
                                    <div className="col-md-3 ps-0">
                                      <div className="">
                                        <p className="origin">
                                          {item.product_desc}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="col-md-5">
                                      <div className="d-flex align-items-center justify-content-center">
                                        <p className="origin">
                                          {item.collection_from_name}
                                        </p>
                                        <div className="arrow">
                                          <i className="fi fi-rr-arrow-right mx-2 arr_icon"></i>
                                        </div>
                                        <p className="origin">
                                          {item.delivery_to_name}
                                          <span className="fright_type">
                                            ({item.freight})
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="col-md-2">
                                      <div className="text-center">
                                        <p className="origin"></p>
                                      </div>
                                    </div>
                                    <div className="col-md-2 pe-0">
                                      <div className="text-end">
                                        <div className="dropdown">
                                          <a
                                            href=""
                                            type="button"
                                            className="act_btn dropdown-toggle"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                          >
                                            Action
                                          </a>
                                          <div className="dropdown-menu">
                                            <a className="dropdown-item det_page">
                                              <VisibilityIcon
                                                onClick={() => {
                                                  handleclickurl(item.id);
                                                }}
                                                style={{
                                                  color: "rgb(27 34 69)",
                                                  cursor: "pointer",
                                                  marginRight: "10px",
                                                  width: "20px",
                                                }}
                                              />
                                              View
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="">
                                  <div className="d-flex align-items-center">
                                    <span className="dot bg-info me-2"></span>
                                    <p className="text-info mb-0">
                                      Estimated
                                    </p>
                                  </div>
                                  {/* <input type="radio" className="input_user mb-0" /> */}
                                  {/* <label className="status">
                                    {item.status == 1 ? (
                                      <div className="d-flex">
                                        <span className="dot bg-success me-2"></span>
                                        <p className="text-success mb-0">
                                          Accepted
                                        </p>
                                      </div>
                                    ) : item.status == 2 ? (
                                      <div className="d-flex">
                                        <span className="dot bg-danger me-2"></span>
                                        <p className="text-danger mb-0">
                                          Declined
                                        </p>
                                      </div>
                                    ) : item.status == 3 ? (
                                      <div className="d-flex">
                                        <span className="dot bg-secondary me-2"></span>
                                        <p className="text-secondary mb-0">
                                          Partial
                                        </p>
                                      </div>
                                    ) : item.status == 4 ? (
                                      <div className="d-flex">
                                        <span className="dot bg-info me-2"></span>
                                        <p className="text-info mb-0">
                                          Estimated
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="d-flex">
                                        <span className="dot bg-dark me-2"></span>
                                        <p className="text-dark mb-0">
                                          Pending
                                        </p>
                                      </div>
                                    )}
                                  </label> */}
                                </div>
                              </td>
                              {/* <th >{startIndex + index + 1}</th>
                                                            <td>{item.serial_number}</td> */}
                              {/* <td></td>
                                                            <td></td> */}
                              {/* <td>{item.freight_currency}</td>
                                                            <td>{item.freight_agent}</td>
                                                            <td>{item.dimension}</td> */}
                              {/* <td>

                                                            </td> */}
                            </tr>
                          </>
                        );
                      })}
                  </tbody>
                </table>
                <div>
                  <button
                    disabled={currentPage === 1}
                    className="btn pagePre rounded"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                  <button
                    disabled={currentPage === totalPages}
                    className="btn pageNext rounded"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
