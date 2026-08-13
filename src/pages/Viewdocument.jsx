import { Box, Button, Modal } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";

export default function Viewdocument() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [openmodal, setOpenmodal] = useState(false);
  const [files, setFiles] = useState(null);
  const getdata = async () => {
    try {
      const data = {
        freight_id: id,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetByIDAllFreightDocs`,
        data
      );
      console.log(response.data.data);
      setData(response.data.data);
      setData1(response.data.data[0].documents);
      setData2(response.data.data[0].EXTRA_documents);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getdata();
  }, []);

  const handleclickc = () => {
    setOpenmodal(true);
  };
  const closeModal1 = () => {
    setOpenmodal(false);
  };

  const handechnage = (e) => {
    setFiles(e.target.files[0]);
  };

  const handleapipost = () => {
    const formdata = new FormData();
    formdata.append("freight_id", id);
    formdata.append("document", files);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}AddFreightDoc`, formdata)
      .then((response) => {
        if (response.data.success === true) {
          closeModal1();
          toast.success(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="">All Document</h5>
              </div>
              <div className="text-end">
                <button className="btn btn-secondary" onClick={handleclickc}>
                  Add Document
                </button>
              </div>
            </div>
            <section className="my-4">
              <div className="row">
                <div className="col-md-4 pe-4">
                  <div className="card desti_card">
                    <div className="card-body">
                      <div className="">
                        <h6 className="orgin_hd">Document</h6>
                        <span className="line"></span>
                      </div>
                      <div className="main_det">
                        <div class="table-responsive">
                          <table class="det_show">
                            <tbody>
                              <tr>
                                {data1?.map((item, index) => {
                                  return (
                                    <>
                                      <div className="my-4">
                                        <a
                                          href={`${process.env.REACT_APP_BASE_URLdocument}${item?.doc}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="view_docu ms-2 my-2"
                                        >
                                          {item?.document_name}
                                        </a>
                                        <br />
                                      </div>
                                    </>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card desti_card">
                    <div className="card-body">
                      <div className="">
                        <h6 className="orgin_hd">Attach Estimate</h6>
                        <span className="line"></span>
                      </div>
                      <div className="main_det">
                        <div class="table-responsive">
                          <table class="det_show">
                            <tbody>
                              <tr>
                                <div className="my-4 w-100">
                                  <td>
                                    {data[0]?.attachment_Estimate === null ? (
                                      ""
                                    ) : (
                                      <>
                                        <a
                                          href={`${process.env.REACT_APP_BASE_URLdocument}${data[0]?.attachment_Estimate}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="view_docu ms-2"
                                        >
                                          {data[0]?.attachment_Estimate}
                                        </a>
                                        <br />
                                      </>
                                    )}
                                  </td>
                                </div>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 ps-4">
                  <div className="card desti_card">
                    <div className="card-body">
                      <div className="">
                        <h6 className="orgin_hd">Extra Document</h6>
                        <span className="line"></span>
                      </div>
                      <div className="main_det">
                        <div class="table-responsive">
                          <table class="det_show">
                            <tbody>
                              <div className="my-3">
                                {data2?.map((item, index) => {
                                  console.log(item);
                                  return (
                                    <>
                                      <a
                                        href={`${process.env.REACT_APP_BASE_URLdocument}${item?.doc}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="view_docu ms-2"
                                      >
                                        {item.doc}
                                      </a>
                                      <br />
                                    </>
                                  );
                                })}
                              </div>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        <Modal
          open={openmodal}
          onClose={closeModal1}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
            }}
          >
            <div className="modal-header">
              <h2 id="modal-modal-title">Cashbook</h2>
              <button className="btn btn-close" onClick={closeModal1}>
                <CloseIcon />
              </button>
            </div>
            <div className="newModalGap">
              <div className="row my-3  ">
                <div className="col-lg-12">
                  <h5>Attach Quote</h5>
                  <input
                    type="file"
                    onChange={handechnage}
                    className=" border rounded px-3 py-2 px-2"
                  ></input>
                </div>
              </div>
              <Button
                className="btn btn-secondary text-white"
                onClick={handleapipost}
              >
                Apply
              </Button>
            </div>
          </Box>
        </Modal>
        
      </div>
    </>
  );
}
