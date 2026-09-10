import axios from "axios";
import React, { useEffect, useState } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../Assests/logotransparent.png";
import { Modal, Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { usePDF } from "react-to-pdf";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
export default function Clearencedetails() {
  const [details, setDetails] = useState([]);
  const navigate = useNavigate();
  const [calculation1, setCalculation1] = useState("");
  const [calculation2, setCalculation2] = useState("");
  const [calculation3, setCalculation3] = useState("");
  const [rows, setRows] = useState([]);
  const [finalAmount, setFinalAmount] = useState(0);
  const [extrachange, setExtrachange] = useState("");
  const [hfCode, setHfCode] = useState("");
  const [data, setData] = useState({});
  const [openmodal, setOpenmodal] = useState(false);
  const location = useLocation();
  const [wuotedrate, setWuotedrate] = useState("");
  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });
  console.log(location.state.data1);
  const getdatallestimate = location?.state?.data[0];
  console.log(getdatallestimate);

  const handleclicknav = () => {
    location?.state?.data1 === "update"
      ? navigate("/Admin/calculation-order")
      : navigate("/Admin/custom-clearance-order")
  };
  const getdatainthispage = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-calculated-details`, {
        clearance_id: getdatallestimate.id,
      })
      .then((response) => {
        console.log(response.data.data);
        setDetails(response.data.data);
        console.log(response.data.data[0].quoted_rate);
        setWuotedrate(response.data.data[0].quoted_rate);
        setCalculation1(response.data.data[0]?.total_amount);
        setCalculation2(response.data.data[1]?.total_amount);
        setCalculation3(response.data.data[2]?.total_amount);
        setExtrachange(response.data.data[0]?.final_amount);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  useEffect(() => {
    getdatainthispage();
  }, []);
  const totalcalcualtion =
    (calculation1 ? calculation1 : 0) +
    (calculation2 ? calculation2 : 0) +
    (calculation3 ? calculation3 : 0) +
    (extrachange ? extrachange : 0);

  const handleclick = () => {
    setOpenmodal(true);
  };
  const handelmdal = () => {
    setOpenmodal(false);
  };

  const handleInputChange = (e) => {
    setHfCode(e.target.value);
  };
  const handleValidate = (e) => {
    if (e.charCode < 46 || e.charCode > 57) {
      e.preventDefault();
    }
  };

  const handleClickHf = () => {
    if (rows.length >= 3) {
      toast.error('You can only add up to 3 rows.');
      return;
    }
    const hfcoede = { hs_code: hfCode };

    axios
      .post(`${process.env.REACT_APP_BASE_URL}find-hs-code`, hfcoede)
      .then((response) => {
        console.log(response.data.data)
        setData(response.data.data);
        setRows([...rows, {
          hs_code: hfCode,
          hs_cod_desc: response.data.data.hs_cod_desc,
          valueofgoods: '',
          quotedRate: '',
          csercount: 0,
          datavalttac: 0,
          datavat: 0,
          estimate: 0
        }]);
        setHfCode('');
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handleChangeValueOfGood = (e, index) => {
    const { name, value } = e.target;
    const newRows = [...rows];
    newRows[index][name] = value;
    setRows(newRows);
  };

  const handleClickValue = (index) => {
    const finalVal = rows[index].valueofgoods;
    const calculate10 = finalVal * 0.1;
    const overall = parseFloat(finalVal) + calculate10;
    const finalRes = overall * parseFloat(rows[index].quotedRate);

    const newRows = [...rows];
    newRows[index].csercount = finalRes;
    newRows[index].datavalttac = (finalRes * 0.1).toFixed(2);
    newRows[index].datavat = ((parseFloat(newRows[index].datavalttac) + finalRes) * 0.15).toFixed(2);
    newRows[index].estimate = (parseFloat(newRows[index].datavat) + parseFloat(newRows[index].datavalttac)).toFixed(2);
    setRows(newRows);

    const totalEstimate = newRows.reduce((acc, row) => acc + parseFloat(row.estimate), 0);
    setFinalAmount(totalEstimate);
  };
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div>
            <div>
              <div className="row manageFreight">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                      <ArrowBackIcon
                        onClick={handleclicknav}
                        className="text-dark"
                        style={{ cursor: "pointer" }}
                      />
                      <h4 className="freight_hd mb-0">Estimate PDF</h4>
                    </div>
                    <div className="d-flex gap-3">
                      <div>
                        {getdatallestimate.attachment_Estimate === null ? (
                          ""
                        ) : (
                          <a
                            href={`${process.env.REACT_APP_BASE_URLdocument}${getdatallestimate?.attachment_Estimate}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view_docu ms-2"
                          >
                            View Document
                          </a>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="mx-2">
                          {/* {location?.state?.data1 === "update" ? ( */}
                          {/* // <button onClick={handleclick}>Edit</button>""
                        // ) : (
                          // ""
                        // )} */}
                        </div>
                        <div>
                          <MdDownloadForOffline
                            className="fs-2 "
                            onClick={() => toPDF()}
                            style={{ color: "#1b2245" }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="row mt-4">
                  <div className="col-md-12">
                    <div
                      ref={targetRef}
                      style={{
                        background: "#08080912",
                        padding: "10px",
                      }}
                    >
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td>
                              <table>
                                <tbody>
                                  <tr>
                                    <td style={{ width: "50%" }}>
                                      <div>
                                        <img
                                          style={{ height: 55 }}
                                          src={logo}
                                          alt="hellow"
                                        />
                                      </div>
                                    </td>
                                    <td style={{ width: "50%", color: "#000" }}>
                                      <p
                                        style={{
                                          fontSize: 20,
                                          fontWeight: 600,
                                          marginBottom: "unset",
                                          borderBottom: "1px solid #cb191e",
                                          display: "inline-block",

                                        }}
                                      >
                                        Asia Direct - Africa
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          fontWeight: 500,
                                          marginBottom: "unset",
                                          lineHeight: "1.5",
                                          marginTop: 5,
                                        }}
                                      >
                                        {/* R.C 102069/GU/23078/342 N.I.F. 00619049
                                        Lot 1644 Ext F nord Secteur 06, Tevragh
                                        Zeina Nouakchott , Mauritania
                                        www.asiaDirect.com */}
                                        Asia Direct, Unit 4 Villa Valencia 2 Anemoon Road Glen Marais 1619 South Africa Web www.asiaDirect.africa<br />
                                        VAT Number: 4740280377
                                        TEL: +27 10 448 0733
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              {/* <table
                                style={{

                                  marginTop: "5px",
                                }}
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        fontSize: 14,
                                        textTransform: "lowercase",
                                      }}
                                    >
                                      PO Box 16600 ATLASVILLE
                                    </td>
                                    <td
                                      style={{
                                        fontSize: 14,
                                        padding: "0px 20px",
                                        textTransform: "lowercase",
                                      }}
                                    >
                                      41 Yaldwyn Road Corner Yaldwyn And Tudor
                                      Road Jet Park
                                    </td>
                                    <td
                                      style={{
                                        fontSize: 14,
                                        textTransform: "lowercase",
                                      }}
                                    >
                                      TEL: ++27-11-820 8000 WWW.SACOCFR.CO.ZA
                                    </td>
                                  </tr>
                                </tbody>
                              </table> */}
                              <table
                                style={{
                                  border: "2px solid #1b2245",
                                  padding: "10px 20px",
                                  width: "100%",
                                  marginTop: 5,
                                }}
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        textAlign: "center",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        width: "100%",
                                      }}
                                    >
                                      OCEANFREIGHT IMPORTS ESTIMATE for FOB
                                      General commodity cargo only
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table
                                style={{
                                  border: "2px solid #1b2245",
                                  borderTop: "unset",
                                  width: "100%",
                                }}
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        width: "50%",
                                        borderRight: "2px solid #1a2142",
                                        height: "100%",
                                      }}
                                    >
                                      <table>
                                        <tbody>
                                          <tr>
                                            <td
                                              style={{
                                                fontSize: 14,
                                                padding: "0px 10px",
                                              }}
                                            >
                                              <strong>
                                                Asia Direct - Africa
                                              </strong>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table
                                        style={{
                                          background: "#1b2245",
                                          width: "100%",
                                          color: "white",
                                          fontSize: 14,
                                          textAlign: "center",
                                          margin: "5px 0px",
                                          padding: 2,
                                        }}
                                      >
                                        <tbody>
                                          <tr>
                                            <td style={{ fontSize: 15 }}>
                                              Shipment Details ISO Commodity
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table style={{ width: "100%" }}>
                                        <tbody>
                                          <tr>
                                            <td style={{ padding: "0px 10px" }}>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent:
                                                    "space-between",
                                                }}
                                              >
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",

                                                  }}
                                                >
                                                  <strong>Customer Ref</strong>
                                                </p>
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",
                                                    marginTop: 5,
                                                  }}
                                                >
                                                  {
                                                    getdatallestimate.customer_ref
                                                  }
                                                </p>
                                              </div>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent:
                                                    "space-between",
                                                }}
                                              >
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",

                                                  }}
                                                >
                                                  <strong>Destination</strong>
                                                </p>
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",
                                                    marginTop: 5,
                                                  }}
                                                >
                                                  {
                                                    getdatallestimate.destination
                                                  }
                                                </p>
                                              </div>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent:
                                                    "space-between",
                                                }}
                                              >
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",
                                                    marginTop: 5,
                                                  }}
                                                >
                                                  <strong>
                                                    Goods Description
                                                  </strong>
                                                </p>
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",
                                                    marginTop: 5,
                                                  }}
                                                >
                                                  {getdatallestimate.goods_desc}
                                                </p>
                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table
                                        style={{
                                          background: "#1b2245",
                                          width: "100%",
                                          color: "white",
                                          fontSize: 14,
                                          textAlign: "center",
                                          margin: "5px  0px",
                                          padding: 2,
                                        }}
                                      >
                                        <tbody>
                                          <tr>
                                            <td style={{ fontSize: 15, }}>
                                              Rate of Exchange
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table style={{ width: "100%" }}>
                                        <tbody>
                                          <tr>
                                            <td>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent:
                                                    "space-between",
                                                  padding: "0px 10px",
                                                }}
                                              >
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",
                                                    marginTop: 5,
                                                  }}
                                                >
                                                  <strong>
                                                    {" "}
                                                    Rate of Exchange
                                                  </strong>
                                                </p>
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",
                                                    marginTop: 5,
                                                  }}
                                                >
                                                  <p>{wuotedrate}</p>
                                                </p>
                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                    <td
                                      style={{ width: "50%", paddingTop: 5 }}
                                    >
                                      <table>
                                        <tbody>
                                          <tr>
                                            <td
                                              style={{
                                                width: 170,
                                                display: "block",
                                                padding: "0px 10px 5px 10px",

                                              }}
                                            >
                                              <strong style={{ fontSize: 14, }}>Clearance Number</strong>
                                            </td>
                                            <td
                                              style={{
                                                paddingBottom: 5,
                                                fontSize: 14,
                                              }}
                                            >
                                              {
                                                getdatallestimate.clearance_number
                                              }
                                            </td>
                                          </tr>
                                          <tr>
                                            <td
                                              style={{
                                                padding: "0px 10px 10px 10px",
                                                width: 170,
                                                display: "block",
                                                paddingBottom: 5,
                                                fontSize: 14,
                                              }}
                                            >
                                              <strong style={{ fontSize: 14, }}>Clearing Status</strong>
                                            </td>
                                            <td
                                              style={{
                                                paddingBottom: 5,
                                                fontSize: 14,
                                                padding: "0px 0px 0px 0px",
                                              }}
                                            >
                                              {
                                                getdatallestimate.clearing_status
                                              }
                                            </td>
                                          </tr>
                                          <tr>
                                            <td
                                              style={{
                                                padding: "0px 10px 10px 10px",
                                                width: 170,
                                                display: "block",
                                                paddingBottom: 0,
                                                fontSize: 14,
                                              }}
                                            >
                                              <strong style={{ fontSize: 14, }}>Comment On Docs</strong>
                                            </td>
                                            <td
                                              style={{
                                                paddingBottom: 0,
                                                fontSize: 14,
                                              }}
                                            >
                                              {
                                                getdatallestimate.comment_on_docs
                                              }
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table
                                        style={{
                                          background: "#1b2245",
                                          width: "100%",
                                          color: "white",
                                          fontSize: 14,
                                          textAlign: "center",
                                          margin: "5px 0px",
                                          padding: 2,
                                        }}
                                      >
                                        <tbody>
                                          <tr>
                                            <td style={{ fontSize: 15 }}>
                                              Shipment Details
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table style={{ width: "100%" }}>
                                        <tbody>
                                          <tr>
                                            <td style={{ padding: "0px 10px" }}>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent:
                                                    "space-between",
                                                }}
                                              >
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",
                                                    marginTop: 0,
                                                  }}
                                                >
                                                  <strong> Goods Desc</strong>
                                                </p>
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",
                                                    marginTop: 5,
                                                  }}
                                                >
                                                  {getdatallestimate.goods_desc}
                                                </p>
                                              </div>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent:
                                                    "space-between",
                                                }}
                                              >
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",

                                                  }}
                                                >
                                                  <strong>Port of Entry</strong>
                                                </p>
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: "unset",

                                                  }}
                                                >
                                                  {
                                                    getdatallestimate.port_of_entry_name
                                                  }
                                                </p>
                                              </div>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent:
                                                    "space-between",
                                                }}
                                              >
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: 5,
                                                    marginTop: 5,
                                                  }}
                                                >
                                                  <strong>Port of Exit</strong>
                                                </p>
                                                <p
                                                  style={{
                                                    fontSize: 14,
                                                    marginBottom: 5,
                                                    marginTop: 5,
                                                  }}
                                                >
                                                  {
                                                    getdatallestimate.port_of_exit_name
                                                  }
                                                </p>
                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table
                                style={{
                                  border: "2px solid #1a2142",
                                  width: "35%",
                                  marginTop: 10,
                                  borderBottom: "unset",
                                }}
                              >
                                <tbody>
                                  <tr
                                    style={{
                                      display: "inline-block",
                                      color: "#1a2142",
                                      padding: "1px 14px",
                                      marginLeft: 0,
                                    }}
                                  >
                                    <td>
                                      {" "}
                                      <span
                                        style={{
                                          paddingRight: 20,
                                          fontSize: 14,
                                          fontWeight: 600,
                                        }}
                                      >
                                        {" "}
                                        QUOTE INFORMATION
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table
                                className="table-border"
                                style={{ width: "100%", marginTop: 0 }}
                              >
                                <tbody>
                                  <tr style={{ textAlign: "left" }}>
                                    <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                        width: 150,
                                      }}
                                    >
                                      {" "}
                                      HS codes{" "}
                                    </th>
                                    <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                        width: 200,
                                      }}
                                    >
                                      HS Description
                                    </th>
                                    <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                        width: 200,
                                      }}
                                    >
                                      Goods Value
                                    </th>
                                    <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                        width: 200,
                                      }}
                                    >
                                      Import Duty
                                    </th>
                                    {/* <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                        width: 200,
                                      }}
                                    >
                                      Import Duty Per
                                    </th> */}
                                    <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    >
                                      Values of Good
                                    </th>
                                    <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    >
                                      Vat
                                    </th>
                                    <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    >
                                      Final Amount
                                    </th>
                                    {/* <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    >
                                     
                                    </th> */}
                                  </tr>
                                  {details &&
                                    details.length > 0 &&
                                    details.map((item, index) => {
                                      return (
                                        <>
                                          <tr>
                                            <td
                                              style={{
                                                padding: 5,
                                                border: "1px solid #1a2142",
                                                textAlign: "left",
                                                fontSize: 14,
                                              }}
                                            >
                                              {item.HS_tariff_code}
                                            </td>
                                            <td
                                              style={{
                                                padding: 5,
                                                border: "1px solid #1a2142",
                                              }}
                                            >
                                              {item.HS_description}
                                            </td>
                                            <td
                                              style={{
                                                padding: 5,
                                                border: "1px solid #1a2142",
                                                fontSize: 14,
                                              }}
                                            >
                                              {item.goods_value}
                                            </td>
                                            <td
                                              style={{
                                                padding: 5,
                                                border: "1px solid #1a2142",
                                                fontSize: 14,
                                              }}
                                            >
                                              {item.import_duty}
                                            </td>
                                            {/* <td
                                              style={{
                                                padding: 5,
                                                border: "1px solid #1a2142",
                                                fontSize: 14,
                                              }}
                                            >
                                              {item.import_duty_per}
                                            </td> */}
                                            <td
                                              style={{
                                                padding: 5,
                                                border: "1px solid #1a2142",
                                                fontSize: 14,
                                              }}
                                            >
                                              {item.values_of_good}
                                            </td>


                                            <td
                                              style={{
                                                padding: 5,
                                                border: "1px solid #1a2142",
                                                fontSize: 14,
                                              }}
                                            >
                                              {item.vat}
                                            </td>
                                            <td
                                              style={{
                                                padding: 5,
                                                border: "1px solid #1a2142",
                                                fontSize: 14,
                                              }}
                                            >
                                              {item.total_amount}
                                            </td>
                                            {/* <td
                                              style={{
                                                padding: 5,
                                                border: "1px solid #1a2142",
                                                fontSize: 14,
                                              }}
                                            >
                                             {/* <button>Edit</button> */}
                                            {/* </td> */}

                                          </tr>
                                        </>
                                      );
                                    })}

                                  <tr>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    />
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    >
                                      Extra Charge
                                    </td>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    />
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    ></td>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    ></td>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    ></td>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    >
                                      {extrachange ? extrachange : 0}
                                    </td>
                                    {/* <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    ></th>
                                    <th
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        fontSize: 14,
                                      }}
                                    ></th> */}
                                  </tr>
                                  <tr>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        color: "white",
                                      }}
                                    ></td>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        color: "black",
                                      }}
                                    >
                                      Total Charge
                                    </td>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        color: "white",
                                      }}
                                    ></td>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        color: "white",
                                      }}
                                    ></td>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        color: "white",
                                      }}
                                    ></td>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        color: "white",
                                      }}
                                    ></td>
                                    <td
                                      style={{
                                        padding: 5,
                                        border: "1px solid #1a2142",
                                        color: "black",
                                      }}
                                    >
                                      {totalcalcualtion.toFixed(2)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={openmodal}
        onClose={handelmdal}
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
          }}
        >
          <div className="modal-header">
            <h2 id="modal-modal-title">Edit Estimate</h2>
            <button className="btn btn-close" onClick={handelmdal}>
              <CloseIcon />
            </button>
          </div>
          <div className="newModalGap">
            <div className="row my-3  ">
              <h4>Enter HS code</h4>
              <div className="d-flex ms-2">
                <div className="my-3">
                  <input onChange={handleInputChange} onKeyPress={handleValidate} value={hfCode}></input>
                </div>
                <div>
                  {hfCode && (
                    <button className=" my-3 btn btn-secondary ms-2 rounded-100" onClick={handleClickHf}>
                      +
                    </button>
                  )}
                </div>
              </div>
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
                      <th>Value Of Goods</th>
                      <th>VAT</th>
                      <th>Import Duty</th>
                      <th>Calculate</th>
                    </tr>
                  </thead>
                  <tbody className='esti_tbody'>
                    {rows.map((row, index) => (
                      <tr key={index}>
                        <th>{row.hs_code}</th>
                        <td>{row.hs_cod_desc}</td>
                        <td>15%</td>
                        <td>
                          <input
                            onKeyPress={handleValidate}
                            name="valueofgoods"
                            className='form-control'
                            value={row.valueofgoods}
                            onChange={(e) => handleChangeValueOfGood(e, index)}
                          />
                        </td>
                        <td>
                          <input
                            onKeyPress={handleValidate}
                            name="quotedRate"
                            className='form-control'
                            value={row.quotedRate}
                            onChange={(e) => handleChangeValueOfGood(e, index)} />
                        </td>
                        <td><button
                          className="ms-2 py-1 btn rounded"
                          onClick={() => handleClickValue(index)}
                          style={{ backgroundColor: 'red', color: 'white' }}
                        >
                          Add
                        </button></td>
                        <td>{row.csercount}</td>
                        <td>{row.datavalttac}</td>
                        <td>{row.datavat}</td>
                        <td>{row.estimate}</td>
                      </tr>
                    ))}
                    {rows.length > 0 && (
                      <>
                        <tr>
                          <td colSpan="10" className="text-end">
                            <strong>Final Amount: </strong> {finalAmount.toFixed(2)}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Button
              variant="contained"
              className="text-center"
            // onClick={postattachquote}
            >
              Add Estimate
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
}
