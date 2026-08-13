import React from "react";
import { useLocation } from "react-router-dom";

import { usePDF } from "react-to-pdf";
import logo from "../Assests/logo.png";
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
export default function Downloadprdf() {
  const location = useLocation();
  console.log(location.state.data);
  const getdatallestimate = location?.state.data;
  const { toPDF, targetRef } = usePDF({
    filename: getdatallestimate.freight_number,
  });
  return (
    <div className="wpWrapper">
      <div className="container">
        <div className="row">
          <div className="col-md-12 d-flex justify-content-end">
            <button className="btn_web rounded px-2">
              <div className="d-flex justify-content-between align-items-center">
                <div onClick={() => toPDF()}>
               <DownloadForOfflineIcon />
                </div>
              </div>
            </button>
          </div>
        </div>
        <div className="row ">
          <div className="col-md-12">
            <div
              className="px-5 mt-4"
              ref={targetRef}
              style={{ background: "#cfd0d71c" }}
            >
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td>
                      <table style={{ margin: "20px" }}>
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
                                  paddingBottom: 5,
                                }}
                              >
                                ASIA DIRECT
                              </p>
                              <p
                                style={{
                                  fontSize: 15,
                                  fontWeight: 500,
                                  marginBottom: "unset",
                                  lineHeight: "1.5",
                                  marginTop: 10,
                                }}
                              >
                                R.C 102069/GU/23078/342 N.I.F. 00619049 Lot 1644
                                Ext F nord Secteur 06, Tevragh Zeina Nouakchott
                                , Web www.asiaDirect.com
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table style={{ paddingTop: "20px", marginTop: "20px" }}>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                fontSize: 15,
                                textTransform: "lowercase",
                              }}
                            >
                              PO Box 16600 ATLASVILLE
                            </td>
                            <td
                              style={{
                                fontSize: 15,
                                padding: "0px 20px",
                                textTransform: "lowercase",
                              }}
                            >
                              41 Yaldwyn Road Corner Yaldwyn And Tudor Road Jet
                              Park
                            </td>
                            <td
                              style={{
                                fontSize: 15,
                                textTransform: "lowercase",
                              }}
                            >
                              TEL: ++27-11-820 8000 WWW.SACOCFR.CO.ZA
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table
                        style={{
                          border: "2px solid #1b2245",
                          padding: "10px 20px",
                          width: "100%",
                          marginTop: 20,
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 15,
                                fontWeight: 600,
                                width: "100%",
                              }}
                            >
                              OCEANFREIGHT IMPORTS ESTIMATE for FOB General
                              commodity cargo only
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
                                        fontSize: 15,
                                        padding: "0px 10px",
                                      }}
                                    >
                                      <strong>
                                        DANCLIFF GLOBAL (PTY) LTD t/a DANCIFF
                                        LOGISTICS
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
                                  fontSize: 15,
                                  textAlign: "center",
                                  margin: "10px 0px",
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
                                    {}
                                    <td style={{ padding: "0px 10px" }}>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong> No. of Packages</strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.no_of_packages}
                                        </p>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong>incoterm</strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.incoterm}
                                        </p>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong>dimension</strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.dimension}
                                        </p>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong>Client Name</strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.client_name}
                                        </p>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong> No. of Packages</strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.no_of_packages}
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
                                  fontSize: 15,
                                  textAlign: "center",
                                  margin: "10px 0px",
                                  padding: 2,
                                }}
                              >
                                <tbody>
                                  <tr>
                                    <td style={{ fontSize: 15 }}>
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
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong> Rate of Exchange</strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.exchange_rate}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td style={{ width: "50%", paddingTop: 10 }}>
                              <table>
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        width: 170,
                                        display: "block",
                                        padding: "0px 10px 10px 10px",
                                        fontSize: 15,
                                      }}
                                    >
                                      <strong>Reference</strong>
                                    </td>
                                    <td
                                      style={{
                                        paddingBottom: 10,
                                        fontSize: 15,
                                      }}
                                    >
                                      {getdatallestimate?.client_ref_name}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style={{
                                        padding: "0px 10px 10px 10px",
                                        width: 170,
                                        display: "block",
                                        paddingBottom: 10,
                                        fontSize: 15,
                                      }}
                                    >
                                      <strong>Quote Date</strong>
                                    </td>
                                    <td
                                      style={{
                                        paddingBottom: 15,
                                        fontSize: 15,
                                        padding: "0px 10px 10px 10px",
                                      }}
                                    >
                                      {getdatallestimate?.date}
                                    </td>
                                  </tr>
                                  {/* <tr>
                                <td
                                  style={{
                                    padding: "0px 10px 10px 10px",
                                    width: 170,
                                    display: "block",
                                    paddingBottom: 10,
                                    fontSize: 15
                                  }}
                                >
                                  <strong>Valid Until</strong>
                                </td>
                                <td style={{ paddingBottom: 15, fontSize: 15 }}>
                                  2023/11/07
                                </td>
                              </tr> */}
                                </tbody>
                              </table>
                              <table
                                style={{
                                  background: "#1b2245",
                                  width: "100%",
                                  color: "white",
                                  fontSize: 15,
                                  textAlign: "center",
                                  margin: "10px 0px",
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
                                      {/* <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between"
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: 15,
                                        marginBottom: "unset",
                                        marginTop: 10
                                      }}
                                    >
                                      <strong>  Regions</strong>

                                    </p>
                                    <p
                                      style={{
                                        fontSize: 15,
                                        marginBottom: "unset",
                                        marginTop: 10
                                      }}
                                    >
                                      78
                                    </p>
                                  </div> */}
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong> Origin Country</strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {
                                            getdatallestimate.collection_from_country
                                          }
                                        </p>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong>Port of Loading</strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.port_of_loading}
                                        </p>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong>
                                            Destination of Discharge
                                          </strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {
                                            getdatallestimate?.delivery_to_country
                                          }
                                        </p>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong> Place of Delivery</strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.place_of_delivery}
                                        </p>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong>
                                            {" "}
                                            Freight Collect Accepted
                                          </strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.quote_received}
                                        </p>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong>
                                            {" "}
                                            Frequency from Port of Loading
                                          </strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.quote_received}
                                        </p>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          <strong>
                                            {" "}
                                            Estimated Transit Time
                                          </strong>
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 15,
                                            marginBottom: "unset",
                                            marginTop: 10,
                                          }}
                                        >
                                          {getdatallestimate?.transit_time}
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
                          width: "100%",
                          marginTop: 10,
                          borderBottom: "unset",
                          background: "#1b2245",
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
                              {/* {" "} */}
                              <span
                                style={{
                                  paddingRight: 20,
                                  fontSize: 15,
                                  fontWeight: 600,
                                  color: "#fff",
                                }}
                              >
                                {/* {" "} */}
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
                                fontSize: 15,
                                width: 150,
                              }}
                            >
                              {" "}
                              Items{" "}
                            </th>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                                width: 200,
                              }}
                            >
                              Description
                            </th>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Currency
                            </th>

                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Amount
                            </th>
                            {/* <th
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          GP
                        </th> */}
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Final Amount
                            </th>
                          </tr>
                          <tr>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                textAlign: "left",
                                fontSize: 15,
                              }}
                            >
                              Freight
                            </th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                              }}
                            >
                              {getdatallestimate?.freight}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.freight_currency}
                            </td>

                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.freight_amount}
                            </td>
                            {/* <td
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.freight_gp}
                        </td> */}
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.freightt_amount}
                            </td>
                          </tr>
                          {/* <tr>
                <th
                  style={{
                    padding: 5,
                    border: "1px solid #1a2142",
                    fontSize: 15
                  }}
                >
                  {" "}
                </th>
                <td
                  style={{
                    padding: 5,
                    border: "1px solid #1a2142",
                    fontSize: 15
                  }}
                >
                  Type
                </td>
                <td
                  style={{
                    padding: 5,
                    border: "1px solid #1a2142",
                    fontSize: 15
                  }}
                >
                  50
                </td>
                <td
                  style={{
                    padding: 5,
                    border: "1px solid #1a2142",
                    fontSize: 15
                  }}
                >
                  80
                </td>
                <td
                  style={{
                    padding: 5,
                    border: "1px solid #1a2142",
                    fontSize: 15
                  }}
                >
                  Doe
                </td>
                <td
                  style={{
                    padding: 5,
                    border: "1px solid #1a2142",
                    fontSize: 15
                  }}
                >
                  Doe
                </td>
              </tr> */}
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            />
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Total for Freight
                            </th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            />

                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.freigh_amount}
                            </th>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></th>
                            {/* <th
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                        </th> */}
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                color: "white",
                              }}
                            >
                              -----
                            </td>

                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                color: "white",
                              }}
                            >
                              -----
                            </td>
                            {/* <td
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            color: "white"
                          }}
                        >
                          -----
                        </td> */}
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                color: "white",
                              }}
                            >
                              -----
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                color: "white",
                              }}
                            >
                              -----
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                color: "white",
                              }}
                            >
                              -----
                            </td>
                          </tr>
                          <tr>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                textAlign: "left",
                                fontSize: 15,
                              }}
                            >
                              Origin Charges
                            </th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Origin Pickup
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_currency}
                            </td>

                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.estimate_origin_pick_up}
                            </td>
                            {/* <td
                          style={{
                            padding: 10,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.origin_pickup_gp}
                        </td> */}
                            <td
                              style={{
                                padding: 10,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                textAlign: "left",
                                fontSize: 15,
                              }}
                            ></th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Origin Custom
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_currency}
                            </td>

                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_customs}
                            </td>
                            {/* <td
                          style={{
                            padding: 10,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.origin_customs_gp}

                        </td> */}
                            <td
                              style={{
                                padding: 10,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                textAlign: "left",
                                fontSize: 15,
                              }}
                            ></th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Origin Document
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_currency}
                            </td>

                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_document}
                            </td>
                            {/* <td
                          style={{
                            padding: 10,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.origin_document_gp}

                        </td> */}
                            <td
                              style={{
                                padding: 10,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                textAlign: "left",
                                fontSize: 15,
                              }}
                            ></th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Origin Warehouse
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_currency}
                            </td>

                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_warehouse}
                            </td>
                            {/* <td
                          style={{
                            padding: 10,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.origin_warehouse_gp}

                        </td> */}
                            <td
                              style={{
                                padding: 10,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                textAlign: "left",
                                fontSize: 15,
                              }}
                            ></th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Origin Port Fees
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_currency}
                            </td>

                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_port_fees}
                            </td>
                            {/* <td
                          style={{
                            padding: 10,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.origin_port_fees_gp}

                        </td> */}
                            <td
                              style={{
                                padding: 10,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {" "}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Origin Other
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_currency}
                            </td>

                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_other}
                            </td>
                            {/* <td
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.origin_other_gp}

                        </td> */}
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            />
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Total for Origin Charges
                            </th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            />

                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.origin_amount}
                            </th>
                            {/* <th
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate??.origin_amount_gp}

                        </th> */}
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></th>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 10,
                                border: "1px solid #1a2142",
                                color: "white",
                              }}
                            >
                              -----
                            </td>

                            <td
                              style={{
                                padding: 10,
                                border: "1px solid #1a2142",
                                color: "white",
                              }}
                            >
                              -----
                            </td>
                            <td
                              style={{
                                padding: 10,
                                border: "1px solid #1a2142",
                                color: "white",
                              }}
                            >
                              -----
                            </td>
                            <td
                              style={{
                                padding: 10,
                                border: "1px solid #1a2142",
                                color: "white",
                              }}
                            >
                              -----
                            </td>
                            {/* <td
                          style={{
                            padding: 10,
                            border: "1px solid #1a2142",
                            color: "white"
                          }}
                        >
                          -----
                        </td> */}
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                color: "white",
                              }}
                            >
                              -----
                            </td>
                          </tr>
                          <tr>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                textAlign: "left",
                                fontSize: 15,
                              }}
                            >
                              Destination Charges
                            </th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                              }}
                            >
                              Destation Delivery
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_currency}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_delivery}
                            </td>
                            {/* <td
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.des_delivery_gp}
                        </td> */}
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {" "}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Destation Customs
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_currency}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_customs}
                            </td>
                            {/* <td
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.des_customs_gp}
                        </td> */}
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {" "}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Destation Documents
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_currency}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_document}
                            </td>
                            {/* <td
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.des_document_gp}
                        </td> */}
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {" "}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Destation Warehouse
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_currency}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_warehouse}
                            </td>
                            {/* <td
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.des_warehouse_gp}
                        </td> */}
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {" "}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Destation port fees
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_currency}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_port_fees}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {" "}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Destation Unpack
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_currency}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_unpack}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {" "}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Destation Other
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_currency}
                            </td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_other}
                            </td>
                            {/* <td
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                          {getdatallestimate?.des_other_gp}
                        </td> */}
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            />
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Total for Destation Charges
                            </th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            />
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.des_amount}
                            </th>
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></th>
                            {/* <th
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                        </th> */}
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            />
                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              Overall Estimate
                            </th>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            ></td>
                            <td
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.sub_amount}
                            </td>

                            <th
                              style={{
                                padding: 5,
                                border: "1px solid #1a2142",
                                fontSize: 15,
                              }}
                            >
                              {getdatallestimate?.total_amount}
                            </th>
                            {/* <th
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15
                          }}
                        >
                        </th> */}
                            {/* <th
                          style={{
                            padding: 5,
                            border: "1px solid #1a2142",
                            fontSize: 15,
                          }}
                        >

                        </th> */}
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* {
            getdatallestimate?.order_status == "0" ? (
              <div className="d-flex mt-3 pb-5 ">
                <button className="w-25 btn btn-success" onClick={acceptQuotatyion}>Accept Freight</button>
                <button className=" w-25 btn btn-danger ms-3" onClick={rejectquotation}>Reject Freight</button>
              </div>
            ) : (getdatallestimate?.order_status == "1" ? (<p className="w-25 text-success text-center fw-bold mt-4 ms-5"> Already Accepted </p>) : (<p className="text-danger fw-bold fs-4 my-4 text-center">This Freight is rejected by you.</p>))
          } */}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
