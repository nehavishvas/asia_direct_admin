import Donutchart from "./Donutchart";
import NegativeValuesBarChart from "./Negativevalue";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
export default function Dashboard() {
  ////////////////////////////All state /////////////////////////////////////////////////////
  const [countdata, setCountdata] = useState();
  const navigaet = useNavigate();
  /////////////////////////////get all count in box/////////////////////////////////////////
  const getcountall = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}count-all`,
      );
      if (response.data.success === true) {
        console.log(response.data);
        setCountdata(response.data.details);
      }
    } catch (error) {
      toast.error(error.response.data);
    }
  };
  useEffect(() => {
    getcountall();
  }, []);
  return (
    <>
      <div className="wpWrapper dash_wrap">
        <div className="container-fluid">
          <div className="row g-4">
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
              onClick={() => {
                navigaet("/Admin/manage-customer");
              }}
            >
              <div className="cardDash shadow-md">

                <div className="iconParent">
                  <div className="cardContent">
                    <h6 className="hd_dash">Clients</h6>
                    <p className="para_dash">
                      <CountUp end={countdata?.no_of_clients} />
                    </p>
                  </div>
                  <div className="iconGrad">
                    <i className="fa fa-user"></i>
                  </div>
                </div>
                <div className="cardBottom bg1">
                  <p>View More</p>
                  <i className="fi fi-rr-angle-double-small-right"></i>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
              onClick={() => {
                navigaet("/Admin/managefreight");
              }}
            >
              <div className="cardDash">
                <div className="iconParent">
                  <div className="cardContent">
                    <h5 className="hd_dash">Freights</h5>
                    <p className="para_dash">
                      <CountUp end={countdata?.no_of_freights} />
                    </p>
                  </div>
                  <div className="iconGrad">
                    <i className="fa fa-plane"></i>
                  </div>
                </div>
                <div className="cardBottom bg2">
                  <p>View More</p>
                  <i className="fi fi-rr-angle-double-small-right"></i>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
              onClick={() => {
                navigaet("/Admin/order");
              }}
            >
              <div className="cardDash">
                <div className="iconParent">
                  <div className="cardContent">
                    <h5 className="hd_dash">Orders</h5>
                    <p className="para_dash">
                      <CountUp end={countdata?.no_of_orders} />
                    </p>
                  </div>
                  <div className="iconGrad">
                    <i className="fa fa-truck"></i>
                  </div>
                </div>
                <div className="cardBottom bg3">
                  <p>View More</p>
                  <i className="fi fi-rr-angle-double-small-right"></i>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
              onClick={() => {
                navigaet("/Admin/custom-clearance-order");
              }}
            >
              <div className="cardDash">
                <div className="iconParent">
                  <div className="cardContent">
                    <h5 className="hd_dash">Clearances</h5>
                    <p className="para_dash">
                      <CountUp end={countdata?.no_of_clearance} />
                    </p>
                  </div>
                  <div className="iconGrad">
                    <i className="fa fa-bars"></i>
                  </div>
                </div>
                <div className="cardBottom bg1">
                  <p>View More</p>
                  <i className="fi fi-rr-angle-double-small-right"></i>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
              onClick={() => {
                navigaet("/Admin/calculation-order");
              }}
            >
              <div className="cardDash">
                <div className="iconParent">
                  <div className="cardContent">
                    <h5 className="hd_dash">Clearance Orders</h5>
                    <p className="para_dash">
                      <CountUp end={countdata?.no_Of_clearanceOrder} />
                    </p>
                  </div>
                  <div className="iconGrad">
                    <i className="fa fa-codepen"></i>
                  </div>
                </div>
                <div className="cardBottom bg2">
                  <p>View More</p>
                  <i className="fi fi-rr-angle-double-small-right"></i>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6" onClick={() => { navigaet('/Admin/KPIDashboard') }}>
              <div className="cardDash">
                <div className="iconParent">
                  <div className="cardContent">
                    <h6 className="hd_dash">Leave</h6>
                    <p className="para_dash"><CountUp end={countdata?.no_of_leaves} /></p>
                  </div>
                  <div className="iconGrad">
                    <i className="fa fa-calendar"></i>
                  </div>
                </div>
                <div className="cardBottom bg2">
                  <p>View More</p>
                  <i className="fi fi-rr-angle-double-small-right"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="chart mt-4">
            <div className="row g-4">
              <div className="col-lg-7 col-md-12">
                <div className="h-100 chartCol card">
                  <h4 className="graph_hd">Freight Status</h4>
                  <div className="chartWrapper">
                    <NegativeValuesBarChart />
                  </div>
                </div>
              </div>
              <div className="col-lg-5 col-md-12">
                <div className="card h-100 pieSpace">
                  <h4 className="graph_hd">Freights</h4>
                  <div className="chartWrapper">
                    <Donutchart />
                  </div>
                  <p className="mb-2 text-center">All Freight</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
