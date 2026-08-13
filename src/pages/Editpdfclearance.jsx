import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Modal } from "@mui/material";
import { Button } from "react-bootstrap";

export default function Editpdfclearance() {
  const [showIcons, setShowIcons] = useState(true);
  const navigate = useNavigate();
  const [hfCode, setHfCode] = useState("");
  const [data, setData] = useState({});
  const [rows, setRows] = useState([]);
  const [rows1, setRows1] = useState({});
  const [exdata, setExdata] = useState({});
  const [rows2, setRows2] = useState({});
  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const [rows3, setRows3] = useState({});
  const [rows4, setRows4] = useState({});
  const [rows123, setRows123] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [RowData, setRowData] = useState({});
  const [error, setError] = useState({});
  const [open, setOpen] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);

  const handleInputChange = (e) => {
    setHfCode(e.target.value);
  };

  const handleclickopenbutton = () => setIsModalOpen3(true);
  const handleCloseModal22 = () => setIsModalOpen3(false);

  const handleValidate = (e) => {
    if (e.charCode < 46 || e.charCode > 57) {
      e.preventDefault();
    }
  };

  const handleClickHf = () => {
    if (rows.length >= 3) {
      toast.error("You can only add up to 3 rows.");
      return;
    }
    const hfcoede = { hs_code: hfCode };

    axios
      .post(`${process.env.REACT_APP_BASE_URL}find-hs-code`, hfcoede)
      .then((response) => {
        console.log(response.data.data);
        setData(response.data.data);
        setRows123([
          {
            hs_code: hfCode,
            hs_cod_desc: response.data.data.hs_cod_desc,
            valueofgoods: "",
            quotedRate: "",
            csercount: 0,
            datavalttac: 0,
            datavat: 0,
            estimate: 0,
          },
        ]);
        setHfCode("");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleChangeValueOfGood = (e, index) => {
    const { name, value } = e.target;
    const newRows = [...rows123];
    newRows[index][name] = value;
    setRows123(newRows);
    console.log(newRows);
  };

  const handleClickValue = (index) => {
    const finalVal = rows123[index].valueofgoods;
    const calculate10 = finalVal * 0.1;
    const overall = parseFloat(finalVal) + calculate10;
    const finalRes = overall * parseFloat(rows123[index].quotedRate);

    const newRows = [...rows123];
    newRows[index].csercount = finalRes;
    newRows[index].datavalttac = (finalRes * 0.1).toFixed(2);
    newRows[index].datavat = (
      (parseFloat(newRows[index].datavalttac) + finalRes) *
      0.15
    ).toFixed(2);
    newRows[index].estimate = (
      parseFloat(newRows[index].datavat) +
      parseFloat(newRows[index].datavalttac)
    ).toFixed(2);
    setRows123(newRows);

    const totalEstimate = newRows.reduce(
      (acc, row) => acc + parseFloat(row.estimate),
      0
    );
    setFinalAmount(totalEstimate);
  };

  const handleSaveValue = () => {
    handleValidate12();
  };

  const handleValidate12 = () => {
    let error = {};
    rows.forEach((row, index) => {
      if (!row.valueofgoods) {
        toast.error("Value of goods is required");
        error[`valueofgoods${index}`] = "Value of goods is required";
      }
      if (!row.quotedRate) {
        toast.error("Quoted Rate is required");
        error[`quotedRate${index}`] = "Quoted Rate is required";
      }
    });
    setError(error);
    if (Object.keys(error).length === 0) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, add it!",
      }).then((result) => {
        if (result.isConfirmed) {
          handleApi();
        }
      });
    }
  };

  const handleApi = async () => {
    const reqdata = rows.map((row) => ({
      clearance_id: clearenceid === undefined ? clearenceid1.id : clearenceid,
      client_id: userid?.id ? userid?.id : clearenceid1.user_id,
      hs_code: row.hs_code,
      quoted_rate: row.quotedRate,
      HS_tariff_code: row.hs_code,
      HS_description: row.hs_cod_desc,
      goods_value: row.valueofgoods,
      values_of_good: row.csercount,
      vat: row.datavalttac,
      import_duty_per: row.datavalttac,
      vat_per: "15",
      import_duty: row.datavat,
      customs_amount_due: row.estimate,
      total_amount: finalAmount,
    }));
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}calculate-clearance`,
        {
          data: reqdata,
        }
      );
      console.log(response.data);
      if (response.data.success === true) {
        toast.success(response.data.message);
        //   navigate("/Admin/custom-clearance-order");
      }
    } catch (error) {
      console.log(error.response);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const location1 = useLocation();
  const clearenceid1 = location1?.state?.data;
  const location = useLocation();

  console.log(location1?.state?.data[0]?.id);
  const clearenceid = location?.state?.dataIID;
  const userid = JSON.parse(localStorage.getItem("data123"));

  const handleclicknav = () => {
    navigate("/Admin/custom-clearance-order");
  };

  useEffect(() => {
    getprevdata();
  }, []);

  const getprevdata = async () => {
    try {
      const data = {
        clearance_id:
          clearenceid === undefined ? clearenceid1[0].id : clearenceid,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}get-calculated-details`,
        data
      );
      console.log(response.data.data);
      setRows(response.data.data);
      setRows1(response.data.data[0]);
      setRows2(response.data.data[1]);
      setRows3(response.data.data[2]);
      setRows4(response.data.data[3]);
    } catch (error) {
      console.log(error.response);
    }
  };

  const handleclickrow = async (id) => {
    console.log(id);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const dataget = rows.filter((row) => row.id !== id);
      const data = { id: id };

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}deleteEstimateClearance`,
          data
        );
        console.log(response);
        if (response.data.success === true) {
          setRows(dataget);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong");
      }
    }
  };
  const handlechnagedata = (e) => {
    const { name, value } = e.target;
    setRowData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleclickchnagedata = async () => {
    console.log(rows123);
    console.log(RowData);
    const data = {
      clearance_id: location1?.state?.data[0]?.id,
      client_id: clearenceid1[0]?.user_id,
      quoted_rate: rows123[0].quotedRate,
      HS_tariff_code: rows123[0].hs_code,
      HS_description: rows123[0].hs_cod_desc,
      goods_value: rows123[0].valueofgoods,
      values_of_good: rows123[0].csercount,
      vat: rows123[0].datavalttac,
      import_duty_per: rows123[0].datavalttac,
      vat_per: "15",
      import_duty: rows123[0].datavat,
      customs_amount_due: rows123[0].estimate,
      total_amount: rows123[0].estimate,
    };
    console.log(data);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}calculateEditEstimateClearance`,
        data
      );
      console.log(response.data);
      if (response.data.success === true) {
        toast.success(response.data.message);
        handleCloseModal();
        getprevdata();
      }
    } catch (error) {
      console.log(error.response);
      toast.error(error.response.data.message);
    }
  };
  const Rowdataclick = (row) => {
    console.log(row);
    setOpen(true);
    setRowData(row);
  };
  // /////////////////////////////////////ad modal data
  const handleclickopenmodal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleCloseModal1 = () => setOpen(false);
  // ////////////////////////////////addddmoda;l data

  const showdata = parseInt(RowData?.goods_value) * 0.1;
  console.log(showdata);
  const getdatta = showdata + parseInt(RowData?.goods_value);
  console.log(getdatta);
  const calcval = getdatta * parseInt(RowData.quoted_rate);
  console.log(calcval);

  const totalamount = calcval + parseInt(RowData.import_duty);
  const updateapi = async () => {
    const dataeditapi = {
      id: RowData.id,
      clearance_id: clearenceid1[0]?.id,
      quoted_rate: RowData.quoted_rate,
      HS_tariff_code: RowData.HS_tariff_code,
      HS_description: RowData.HS_description,
      goods_value: RowData.goods_value,
      values_of_good: calcval ? calcval : RowData.values_of_good,
      vat: getdatta ? getdatta : RowData.vat,
      import_duty_per: RowData.import_duty_per,
      vat_per: RowData.vat_per,
      import_duty: RowData.import_duty,
      customs_amount_due: RowData.customs_amount_due,
      total_amount: totalamount ? totalamount : RowData.total_amount,
    };
    console.log(dataeditapi);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}calculateEditEstimateClearance`,
        dataeditapi
      );
      console.log(response);
      if (response.data.success === true) {
        getprevdata();
        handleCloseModal1();
        toast.success("Data Updated");
      }
    } catch (error) {
      console.log(error);
      console.log(error.response.data);
    }
  };
  const sum1 = Number(rows1?.total_amount || 0);
  const sum2 = Number(rows2?.total_amount || 0);
  const sum3 = Number(rows3?.total_amount || 0);
  const sum4 = Number(rows4?.total_amount || 0);
  const finalAmount123333 = sum1 + sum2 + sum3 + sum4;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExdata({ ...exdata, [name]: value });
  };

  const hanldekeypress = (e) => {
    if (e.charCode < 46 || e.charCode > 57) {
      e.preventDefault();
    }
  };

  const finalVal =
    parseFloat(exdata.importer_vat || 0) +
    parseFloat(exdata.Customs_Duty || 0) +
    parseFloat(exdata.Document_Fee || 0) +
    parseFloat(exdata.Customs_Clearing_fee || 0) +
    parseFloat(exdata.Disbursement_fee || 0) +
    parseFloat(exdata.Agency_surcharge || 0);

  const handlepostvalue = async () => {
    const data12 = {
      clearance_id: clearenceid === undefined ? clearenceid1.id : clearenceid,
      import_vat: exdata.importer_vat,
      customs_duty: exdata.Customs_Duty,
      agency_surcharge: exdata.Agency_surcharge,
      disbursement_fee: exdata.Disbursement_fee,
      customs_clearing_fee: exdata.Customs_Clearing_fee,
      document_fee: exdata.Document_Fee,
      final_amount: finalVal,
    };
    console.log(data12);
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}calculateClearanceByAdmin`,
        data12
      )
      .then((response) => {
        console.log(response.data.message);
        if (response.data.success === true) {
          getprevdata();
          handleCloseModal22();
          toast.success(response.data.message);
        }

        // if (response.data.success) {
        // setTimeout(() => {
        // if(location.state)
        // console.log(data)
        // navigate('/Admin/Custom-clearence-byuser')
        // }, [1500])
        // }
        console.log(response.data);
      })
      .catch((error) => {
        toast.error(error.response.data);
      });
  };
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="row  manageFreight">
          <div className="col-md-12">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex gap-3">
                <div>
                  <ArrowBackIcon
                    onClick={handleclicknav}
                    className="text-dark"
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div>
                  <h4 className="freight_hd mt-0">Estimate</h4>
                </div>
              </div>
              <div className="d-flex gap-2">
                <div>
                  <button
                    className="btn btn-secondary"
                    onClick={handleclickopenmodal}
                  >
                    Add Data
                  </button>
                </div>
                <div>
                  <button
                    className="btn btn-secondary"
                    onClick={handleclickopenbutton}
                  >
                    Add Extra charges
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div>

            <div className="table-responsive">
              <table className="table border">
                <thead className="esti_thead">
                  <tr>
                    <th>HS Code</th>
                    <th>Description</th>
                    <th>VAT%</th>
                    <th>Value of Goods</th>
                    <th>Quoted Rate</th>
                    <th></th>
                    <th>VAT</th>
                    <th>Import Duty</th>
                    <th>Calculate</th>
                    {showIcons && <th>Action</th>}
                  </tr>
                </thead>
                <tbody className="esti_tbody">
                  {rows.map((row, index) => {
                    console.log(row);
                    return (
                      <>
                        <tr key={index}>
                          <th>{row.HS_tariff_code}</th>
                          <td>{row.HS_description}</td>
                          <td>15%</td>
                          <td>{row.goods_value}</td>
                          <td>{row.quoted_rate}</td>
                          <td>{row.valueofgoods}</td>
                          <td>{row.vat}</td>
                          <td>{row.import_duty}</td>
                          <td>{row.total_amount}</td>

                          {showIcons && (
                            <td>
                              <div className="editIcon">
                                <i
                                  type="button"
                                  className="fa fa-pencil"
                                  onClick={() => {
                                    Rowdataclick(row);
                                  }}
                                ></i>
                                <i
                                  className="fa fa-trash"
                                  onClick={() => {
                                    handleclickrow(row.id);
                                  }}
                                  aria-hidden="true"
                                ></i>
                              </div>
                            </td>
                          )}
                        </tr>
                      </>
                    );
                  })}

                  <tr>
                    <td colSpan="10" className="text-end">
                      <strong>Total Amount: </strong> {finalAmount123333}
                      <br />
                      <strong>Document Fee: </strong> {rows[0]?.document_fee}
                      <br />
                      <strong>Import VAT: </strong> {rows[0]?.import_vat}
                      <br />
                      {/* <strong>Import VAT: </strong> {finalAmount123333}<br /> */}
                      <strong>Customs Duty: </strong> {rows[0]?.customs_duty}
                      <br />
                      <strong>Agency Surcharge: </strong>{" "}
                      {rows[0]?.agency_surcharge}
                      <br />
                      <strong>Disbursement Fee: </strong>{" "}
                      {rows[0]?.disbursement_fee}
                      <br />
                      <strong>Customs Clearing Fee: </strong>{" "}
                      {rows[0]?.customs_clearing_fee}
                      <br />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="10" className="text-end">
                      <strong>Final Amount: </strong>{" "}
                      {rows[0]?.final_amount + finalAmount123333}
                      <br />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-center"></div>
            
          </div>
          <>
            <div
              className="modal fade"
              id="exampleModal"
              tabIndex={-1}
              aria-labelledby="exampleModalLabel"
              aria-hidden="true"
            ></div>
          </>
          <Modal
            open={isModalOpen3}
            onClose={handleCloseModal22}
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
                width: {
                  xs: "95%",   // mobile
                  sm: "80%",   // tablet
                  md: "60%",   // small laptop
                  lg: "40%",   // desktop
                },

              }}
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h1 className="modal-title fs-5" id="exampleModalLabel">
                      Edit Estimate
                    </h1>
                    <button>
                      <CloseIcon onClick={handleCloseModal22} />
                    </button>
                  </div>
                  <div className="modal-body editEstimate px-2 py-2">
                    <div className="mt-2">
                      <div>
                        <div className="updateLoading">
                          <div className="row">
                            <div className="col-md-6">
                              <label htmlFor="importer_vat">Import VAT</label>
                              <input
                                type="number"
                                className="form-control"
                                id="importer_vat"
                                name="importer_vat"
                                onChange={handleChange}
                                onKeyPress={hanldekeypress}
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="Customs_Duty">Customs Duty</label>
                              <input
                                type="number"
                                className="form-control"
                                id="Customs_Duty"
                                name="Customs_Duty"
                                onChange={handleChange}
                                onKeyPress={hanldekeypress}
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="Agency_surcharge">
                                Agency Surcharge
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="Agency_surcharge"
                                name="Agency_surcharge"
                                onChange={handleChange}
                                onKeyPress={hanldekeypress}
                              />
                            </div>

                            <div className="col-md-6">
                              <label htmlFor="Disbursement_fee">
                                Disbursement Fee
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="Disbursement_fee"
                                name="Disbursement_fee"
                                onChange={handleChange}
                                onKeyPress={hanldekeypress}
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="Customs_Clearing_fee">
                                Customs Clearing Fee
                              </label>
                              <input
                                type="number"
                                className="form-control mb-0"
                                id="Customs_Clearing_fee"
                                name="Customs_Clearing_fee"
                                onChange={handleChange}
                                onKeyPress={hanldekeypress}
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="Document_Fee">Document Fee</label>
                              <input
                                type="number"
                                className="form-control mb-0"
                                id="Document_Fee"
                                name="Document_Fee"
                                onChange={handleChange}
                                onKeyPress={hanldekeypress}
                              />
                            </div>
                            <div className="col-md-12 mb-4 mt-2">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <button
                                    className="btn btn-primary btn-block"
                                    onClick={() => {
                                      handlepostvalue();
                                    }}
                                  >
                                    Calculate
                                  </button>
                                </div>
                                <div>
                                  <h6 className="fw-semibold">
                                    Overall Value:
                                    {" "}   <span className="text-success">
                                      {finalVal}
                                    </span>
                                  </h6>
                                </div>
                              </div>

                            </div>

                          </div>


                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div className="modal-footer pb-2">
                    <button
                                type="button"
                                className="btn btn-primary"
                                onClick={updateapi}
                              >
                                Update
                              </button>
                  </div> */}
                </div>
              </div>
            </Box>
          </Modal>
          <Modal
            open={open}
            onClose={handleCloseModal1}
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
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h1 className="modal-title fs-5" id="exampleModalLabel">
                      Edit Estimate
                    </h1>
                    <button className="btn-close">
                      <CloseIcon onClick={handleCloseModal1} />
                    </button>
                  </div>
                  <div className="modal-body editEstimate px-2 py-2">
                    <div className="row">
                      <div className="col-lg-6">
                        <h6>HS Code </h6>
                        <input
                          type="text"
                          value={RowData.HS_tariff_code}
                          placeholder="0102.29	"
                          name="HS_tariff_code"
                          onChange={handlechnagedata}
                        />
                      </div>
                      <div className="col-lg-6">
                        <h6>VAT% </h6>
                        <input
                          type="text"
                          value={RowData.vat_per}
                          placeholder="0102.29	"
                          name="vat_per"
                          onChange={handlechnagedata}
                        />
                      </div>
                      <div className="col-lg-6">
                        <h6>Value of Goods </h6>
                        <input
                          type="text"
                          name="values_of_good"
                          disabled
                          onChange={handlechnagedata}
                          value={calcval ? calcval : RowData.values_of_good}
                          placeholder="0102.29	"
                        />
                      </div>
                      <div className="col-lg-6">
                        <h6>Quoted Rate </h6>
                        <input
                          type="text"
                          value={RowData.quoted_rate}
                          placeholder="0102.29	"
                          name="quoted_rate"
                          onChange={handlechnagedata}
                        />
                      </div>
                      <div className="col-lg-6">
                        <h6>Value Of Goods </h6>
                        <input
                          type="text"
                          value={RowData.goods_value}
                          placeholder="0102.29	"
                          name="goods_value"
                          onChange={handlechnagedata}
                        />
                      </div>
                      <div className="col-lg-6">
                        <h6>VAT </h6>
                        <input
                          type="text"
                          disabled
                          value={getdatta ? getdatta : RowData.vat}
                          placeholder="0102.29	"
                          name="vat"
                          onChange={handlechnagedata}
                        />
                      </div>
                      <div className="col-lg-6">
                        <h6> Import Duty </h6>
                        <input
                          type="text"
                          value={RowData.import_duty}
                          placeholder="0102.29	"
                          name="import_duty"
                          onChange={handlechnagedata}
                        />
                      </div>
                      <div className="col-lg-6">
                        <h6> Calculate </h6>
                        <input
                          type="text"
                          disabled
                          value={
                            totalamount ? totalamount : RowData.total_amount
                          }
                          placeholder="0102.29	"
                          name="total_amount"
                          onChange={handlechnagedata}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer pb-2">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={updateapi}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
          <Modal
            open={isModalOpen}
            onClose={handleCloseModal}
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
                width: {
                  xs: "95%",   // mobile
                  sm: "80%",   // tablet
                  md: "70%",   // small laptop
                  lg: "60%",   // desktop
                },
              }}
            >
              <div className="modal-header">
                <h2 id="modal-modal-title">Add Estimate</h2>

                <button className="btn btn-close" onClick={handleCloseModal}>
                  <CloseIcon />
                </button>
              </div>
              <div className="newModalGap noFormaControl" style={{ overflow: "unset" }}>
                <div className="row">
                  <div className="d-flex">
                    <div>
                      <label>Enter your HS code</label>
                      <div className="d-flex hsCodeParent">

                        <input
                          type="text"
                          className="form-control"
                          placeholder="HS Code"
                          name="HS_tariff_code"
                          value={hfCode}
                          onChange={handleInputChange}
                          onKeyPress={handleValidate}
                        />
                        <button className="add_hscode" onClick={handleClickHf}>
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                  <div className="mt-3">
                    <div className="updateLoading">
                      <div className="table-responsive estTableEdit">
                        <table className="table">
                          <thead className="esti_thead">
                            <tr>
                              <th>HS Code</th>
                              <th>Description</th>
                              <th>VAT%</th>
                              <th>Value of Goods</th>
                              <th>Quoted Rate</th>
                              <th></th>
                              <th>Value Of Goods</th>
                              <th>VAT</th>
                              <th>Import Duty</th>
                              <th>Calculate</th>
                              {/* {showIcons && <th>Action</th>} */}
                            </tr>
                          </thead>
                          {rows123.map((row, index) => {
                            console.log(row);
                            return (
                              <>
                                <tr key={index}>
                                  <td>
                                    {" "}
                                    <strong>{row.hs_code}</strong>{" "}
                                  </td>
                                  <td>{row.hs_cod_desc}</td>
                                  <td>15%</td>
                                  <td>
                                    <input
                                      onKeyPress={handleValidate}
                                      name="valueofgoods"
                                      className="form-control"
                                      value={row.valueofgoods}
                                      onChange={(e) =>
                                        handleChangeValueOfGood(e, index)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      onKeyPress={handleValidate}
                                      name="quotedRate"
                                      className="form-control"
                                      value={row.quotedRate}
                                      onChange={(e) =>
                                        handleChangeValueOfGood(e, index)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <div className="unsetLt">
                                      <button
                                        className="ms-2 py-1 btn rounded"
                                        onClick={() => handleClickValue(index)}
                                        style={{
                                          backgroundColor: "red",
                                          color: "white",
                                        }}
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </td>
                                  <td>{row.csercount}</td>
                                  <td>{row.datavalttac}</td>
                                  <td>{row.datavat}</td>
                                  <td>{row.estimate}</td>
                                </tr>
                              </>
                            );
                          })}
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mb-3">
                <button
                  variant="contained"
                  className="blueBtn"
                  onClick={handleclickchnagedata}
                >
                  Submit
                </button>
              </div>
            </Box>
          </Modal>
        </div>
      </div>
    </div >
  );
}
