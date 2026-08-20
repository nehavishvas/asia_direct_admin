import React, { useEffect, useState } from "react";
import Topbar from "../Topbar";
import Navbar from "../homepage/Navbar";
import Footer from "../homepage/Footer";
import image1 from "../../assestss/slide3.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Modal, Box, Typography, Button } from "@mui/material";
const pageSize = 5;
export default function Customclearence() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [id, setId] = useState("");
  const [images, setImages] = useState({
    Supplier_invoice: null,
    Packing_list: null,
    Proof_of_payment: null,
    Waybill: null,
    Bill_of_lading: null,
    Arrival_notification: null,
    Product_brochures: null,
    Product_literature: null,
    Letter_of_authority: null,
  });
  const filteredData = data.filter((item) => {
    console.log(item);
    return (
      item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.goods_desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.port_of_entry.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  const totalPage = Math.ceil(filteredData.length / pageSize);
  const startindex = (currentPage - 1) * pageSize;
  const endIndex = startindex + pageSize;
  const currentdata = filteredData.slice(startindex, endIndex);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const getdata = JSON.parse(localStorage.getItem("data"));
  const getdatat = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-client-clearing`, {
        user_id: getdata.id,
      })
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };
  useEffect(() => {
    window.scrollTo(0, 0);
    getdatat();
  }, []);
  ////////////////////////////////////////////////////update clearence ///////////////////////
  const [predata, setPredata] = useState({});
  const handleidvali = (id) => {
    console.log(id);
    const useridche = data.filter((item) => {
      return item.id === id;
    });
    const userdata = useridche[0];
    console.log(userdata);
    console.log(userdata.id);
    setPredata((prevData) => ({
      ...prevData,
      clearing_id: userdata.id,
      trans_reference: userdata.trans_reference,
      client: userdata.client,
      customer_ref: userdata.customer_ref,
      goods_desc: userdata.goods_desc,
      destination: userdata.destination,
      port_of_entry: userdata.port_of_entry,
      port_of_exit: userdata.port_of_exit,
      clearing_agent: userdata.clearing_agent,
      clearing_status: userdata.clearing_status,
      clearing_result: userdata.clearing_result,
      document_req: userdata.document_req,
      document: userdata.document,
      sad500: userdata.sad500,
      comment_on_docs: userdata.comment_on_docs,
    }));
  };
  const hanldechange = (e) => {
    const { name, value } = e.target;
    setPredata({ ...predata, [name]: value });
  };
  const updatedata = () => {
    const formdata = new FormData();
    formdata.append("clearing_id", predata.clearing_id);
    formdata.append("trans_reference", predata.trans_reference);
    formdata.append("client", predata.client);
    formdata.append("customer_ref", predata.customer_ref);
    formdata.append("goods_desc", predata.goods_desc);
    formdata.append("destination", predata.destination);
    formdata.append("port_of_entry", predata.port_of_entry);
    formdata.append("port_of_exit", predata.port_of_exit);
    formdata.append("clearing_agent", predata.clearing_agent);
    formdata.append("clearing_status", predata.clearing_status);
    formdata.append("clearing_result", predata.clearing_result);
    formdata.append("document_req", predata.document_req);
    formdata.append("document", predata.document);
    formdata.append("sad500", predata.sad500);
    formdata.append("comment_on_docs", predata.comment_on_docs);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}update-clearing`, formdata)
      .then((response) => {
        getdatat();
        toast.success(response.data.message);
        console.log(response.data);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handleclicknavi = (id) => {
    const userdata1 = data.filter((item) => {
      return item.id === id;
    });
    console.log(userdata1);
    navigate("/clearence-details", { state: { data: userdata1[0] } });
  };
  const handledelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(`${process.env.REACT_APP_BASE_URL}delete-clearing`, {
            clearing_id: id,
          })
          .then((response) => {
            getdatat();
            toast.success(response.data.message);
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });
      }
    });
  };
  const handledeleteclearenceid = (id) => {
    navigate("/calculate-clearence", { state: { data: id } });
  };
  const handleclickbnavigatethe = () => {
    navigate("/Add-Custom-clearence");
  };
  const handlecickcancle = (id) => {
    const data12 = {
      clearance_id: id,
      user_id: getdata.id,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}accept-clearance`, data12)
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handleclick = (id) => {
    const data12 = {
      clearance_id: id,
      user_id: getdata.id,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}reject-clearance`, data12)
      .then((response) => {
        toast.success(response.data.data.message);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handleclickuoploaddoc = (item) => {
    setOpenModal(true);
    setId(item.id);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  }; 
  const handleFileChangeimg = (e) => {
    const { name, files } = e.target;
    setImages((prevData) => ({
      ...prevData,
      [name]: files[0],
    }));
  };
  const handlepostimahe = () => {
    const formData = new FormData();
    formData.append("supplier_invoice", images.Supplier_invoice);
    formData.append("packing_list", images.Packing_list);
    formData.append("proof_of_payment", images.Proof_of_payment);
    formData.append("waybill", images.Waybill);
    formData.append("bill_of_lading", images.Bill_of_lading);
    formData.append("arrival_notification", images.Arrival_notification);
    formData.append("product_brochures", images.Product_brochures);
    formData.append("product_literature", images.Product_literature);
    formData.append("letter_of_authority", images.Letter_of_authority);
    formData.append("clearance_id", id);
    console.log(formData);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}upload-clrearance-doc`, formData)
      .then((response) => {
        toast.success(response.data.message);
        setOpenModal(false);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  return (
    <div>
      <Topbar />
      <Navbar />
      <>
        <section
          className="bannerBg"
          style={{ backgroundImage: `url(${image1})` }}
        >
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <h1>Custom Clearance</h1>
                <h5>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. illo
                  quae vero{" "}
                </h5>
              </div>
            </div>
          </div>
        </section>
        {data.length == 0 ? (
          <div></div>
        ) : (
          <div className=" container d-flex justify-content-between mt-5">
            <div className="searchManageFre">
              <input
                className="px-2 my-3 py-2 rounded customSearch"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search freight..."
              ></input>
            </div>
            <div>
              <button
                className="btn  btn-danger mt-3"
                onClick={() => {
                  navigate("/Add-Custom-clearence");
                }}
              >
                Add clearance
              </button>
            </div>
          </div>
        )}
        {data.length == 0 ? (
          <>
            <p className="text-center fs-1 fw-bold  my-5">
              Believe in Our service{" "}
            </p>
            <div className="text-center mb-5">
              <button
                className="btn btn-danger text-center"
                onClick={handleclickbnavigatethe}
              >
                Add Clearance
              </button>
            </div>
            <p className=" text-center">
              You doesn't have add any clearence before{" "}
            </p>
          </>
        ) : (
          <>
            <section className="manageFrightSec pt80 mt-4">
              <div className="container">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="tableManageFright mainTableClearnce table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Sr.No.</th>
                            <th>Clearance number</th>
                            <th>Good Description</th>
                            <th>Destination </th>
                            <th>Port of Entry </th>
                            <th>Clearance Status</th>
                            <th>Document</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentdata &&
                            currentdata.length > 0 &&
                            currentdata.map((item, index) => {
                              console.log(item);
                              return (
                                <>
                                  <tr key={index}>
                                    <td
                                      onClick={() => {
                                        handleclicknavi(item?.id);
                                      }}
                                    >
                                      {startindex + index + 1}
                                    </td>
                                    <td
                                      onClick={() => {
                                        handleclicknavi(item?.id);
                                      }}
                                    >
                                      {item.clearance_number}
                                    </td>
                                    <td
                                      onClick={() => {
                                        handleclicknavi(item?.id);
                                      }}
                                    >
                                      {item.goods_desc}
                                    </td>
                                    <td
                                      onClick={() => {
                                        handleclicknavi(item?.id);
                                      }}
                                    >
                                      {item.destination}
                                    </td>
                                    <td
                                      onClick={() => {
                                        handleclicknavi(item?.id);
                                      }}
                                    >
                                      {item.port_of_entry}
                                    </td>
                                    <td>
                                      {item.inquery_status === "0" ? (
                                        <p>pending</p>
                                      ) : item.inquery_status === "1" ? (
                                        <p>Accept</p>
                                      ) : item.inquery_status === "2" ? (
                                        <p>Declined</p>
                                      ) : (
                                        ""
                                      )}
                                    </td>
                                    <td>
                                      {item.inquery_status === "1" ? (
                                        <button
                                          onClick={() => {
                                            handleclickuoploaddoc(item);
                                          }}
                                          className="btn btn-danger"
                                        >
                                          Upload Doc
                                        </button>
                                      ) : (
                                        "----"
                                      )}
                                    </td>
                                    <td>
                                      <div class="dropdown">
                                        <button
                                          class="dropdown-toggle editModalBtn"
                                          type="button"
                                          data-bs-toggle="dropdown"
                                          aria-expanded="false"
                                        ></button>
                                        <ul class="dropdown-menu cusTomTable">
                                          <div className="btnManageFreight ">
                                            <i
                                              className="fa fa-trash"
                                              onClick={() => {
                                                handledelete(item.id);
                                              }}
                                            />
                                            {item.inquery_status === "1" ? (
                                              <>
                                                <i>
                                                  <button
                                                    onClick={() => {
                                                      handlecickcancle(item.id);
                                                    }}
                                                  >
                                                    <CheckCircleIcon />
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      handleclick(item.id);
                                                    }}
                                                    className="ms-1"
                                                  >
                                                    <CancelIcon />
                                                  </button>
                                                </i>
                                              </>
                                            ) : (
                                              ""
                                            )}
                                            <i
                                              className="fi fi-rr-calculator"
                                              onClick={() => {
                                                handledeleteclearenceid(
                                                  item.id
                                                );
                                              }}
                                            />
                                            <i
                                              type="button"
                                              className="fa fa-edit"
                                              data-bs-toggle="modal"
                                              data-bs-target="#exampleModal"
                                              onClick={() => {
                                                handleidvali(item.id);
                                              }}
                                            ></i>
                                          </div>
                                        </ul>
                                      </div>
                                    </td>
                                  </tr>
                                </>
                              );
                            })}
                        </tbody>
                      </table>
                      <div className="mt-4">
                        <button
                          disabled={currentPage === 1}
                          className="btn rounded"
                          style={{ backgroundColor: "red", color: "white" }}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          Previous
                        </button>
                        <span>{`Page ${currentPage} of ${totalPage}`}</span>
                        <button
                          disabled={currentPage === totalPage}
                          className="btn rounded"
                          style={{ backgroundColor: "#011324", color: "white" }}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <div
              className="modal fade"
              id="exampleModal"
              tabIndex={-1}
              aria-labelledby="exampleModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h1 className="modal-title fs-5" id="exampleModalLabel">
                      Update Custom Clearance
                    </h1>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    <section className="frightFormSec pt80 pb80">
                      <div className="container">
                        <div className="row">
                          <div className="col">
                            <label htmlFor="" className="text-dark">
                              Customer Refrenceef
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={predata.customer_ref}
                              onChange={hanldechange}
                              name="customer_ref"
                            />
                          </div>
                          <div className="col">
                            <label htmlFor="" className="text-dark">
                              Goods Description
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={predata.goods_desc}
                              onChange={hanldechange}
                              name="goods_desc"
                              placeholder="client id"
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col">
                            <label htmlFor="" className="text-dark">
                              Destination
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={predata.destination}
                              onChange={hanldechange}
                              name="destination"
                            />
                          </div>
                          <div className="col">
                            <label htmlFor="" className="text-dark">
                              Port of Entry
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={predata.port_of_entry}
                              onChange={hanldechange}
                              name="port_of_entry"
                              placeholder="client id"
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col">
                            <label htmlFor="" className="text-dark">
                              Port of Exit
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={predata.port_of_exit}
                              onChange={hanldechange}
                              name="port_of_exit"
                            />
                          </div>
                          <div className="col">
                            <label htmlFor="" className="text-dark">
                              Clearing Status
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={predata.clearing_status}
                              onChange={hanldechange}
                              name="clearing_status"
                            />
                          </div>
                        </div>
                        <div className="row"></div>
                      </div>
                    </section>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      data-bs-dismiss="modal"
                      className="btn btn-primary"
                      onClick={updatedata}
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              height: 500,
              overflow: "scroll",
            }}
          >
            <Typography variant="h5" component="h1" className="col-12 mb-3">
              Upload Clearance Document
            </Typography>
            <form>
              <div className="form-group">
                <label htmlFor="uploadDoc">Supplier Invoice</label>
                <input
                  type="file"
                  className="form-control"
                  id="uploadDoc"
                  name="Supplier_invoice"
                  onChange={handleFileChangeimg}
                />
              </div>
              <div className="form-group">
                <label htmlFor="uploadDoc">Packing List</label>
                <input
                  type="file"
                  className="form-control"
                  id="uploadDoc"
                  name="Packing_list"
                  onChange={handleFileChangeimg}
                />
              </div>
              <div className="form-group">
                <label htmlFor="uploadDoc">Proof of Payment</label>
                <input
                  type="file"
                  className="form-control"
                  id="uploadDoc"
                  name="Proof_of_payment"
                  onChange={handleFileChangeimg}
                />
              </div>
              <div className="form-group">
                <label htmlFor="uploadDoc">Waybill</label>
                <input
                  type="file"
                  className="form-control"
                  id="uploadDoc"
                  name="Waybill"
                  onChange={handleFileChangeimg}
                />
              </div>
              <div className="form-group">
                <label htmlFor="uploadDoc">Bill of Lading</label>
                <input
                  type="file"
                  className="form-control"
                  id="uploadDoc"
                  name="Bill_of_lading"
                  onChange={handleFileChangeimg}
                />
              </div>
              <div className="form-group">
                <label htmlFor="uploadDoc">Product Brochures</label>
                <input
                  type="file"
                  className="form-control"
                  id="uploadDoc"
                  name="Product_brochures"
                  onChange={handleFileChangeimg}
                />
              </div>
              <div className="form-group">
                <label htmlFor="uploadDoc">Product Literature</label>
                <input
                  type="file"
                  className="form-control"
                  id="uploadDoc"
                  name="Product_literature"
                  onChange={handleFileChangeimg}
                />
              </div>
              <div className="form-group">
                <label htmlFor="uploadDoc">Letter of Authority</label>
                <input
                  type="file"
                  className="form-control"
                  id="uploadDoc"
                  name="Letter_of_authority"
                  onChange={handleFileChangeimg}
                />
              </div>
              <div className="form-group">
                <label htmlFor="uploadDoc">Arrival Notification</label>
                <input
                  type="file"
                  className="form-control"
                  id="uploadDoc"
                  name="Arrival_notification"
                  onChange={handleFileChangeimg}
                />
              </div>
              <Button
                variant="contained"
                color="primary"
                onClick={handlepostimahe}
              >
                Upload
              </Button>
            </form>
          </Box>
        </Modal>
      </>
      <Footer />
      
    </div>
  );
}
