import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Img1 from "../../Assests/logotransparent.png";
export default function Conformpass() {
  const navigate = useNavigate();
  const handletop = () => {
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    handletop();
  }, []);
  const [data, setData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState([]);
  const handlechange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };
  const handlevalidate = (value) => {
    let errors = {};
    if (!value.newPassword) {
      errors.newPassword = "New password is required";
    }
    if (!value.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    }
    if (
      value.newPassword &&
      value.confirmPassword &&
      value.newPassword !== value.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match";
    }
    setError(errors);
    return Object.keys(errors).length === 0;
  };
  const handleclick = () => {
    if (handlevalidate(data)) {
      apihit();
    }
  };
  const token1 = localStorage.getItem("token");
  const apihit = () => {
    const datauswer = {
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    };
    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}reset-password?token=${token1}`,
        datauswer
      )
      .then((response) => {
        console.log(response.data.msg);
        toast.success(response.data.msg);
        if (response.data.success === true) {
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.msg);
      });
  };

  return (
    <div>
      <section className="loginmain">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="d-flex justify-content-center align-items-center">
                <div className="loginFormMain">
                  <div className="logoLogin">
                    <img src={Img1} alt="Logo" />
                  </div>
                  <div className="form-floating">
                    <div className="icon_parent">
                      <div className="icon_child">
                        <i class="fa fa-lock login_icon" aria-hidden="true"></i>
                      </div>
                    </div>
                    <div className="">
                      <input
                        type="password"
                        name="newPassword"
                        onChange={handlechange}
                        placeholder="New password"
                        className="py-2 form-control"
                        style={{ color: "black" }}
                      />
                      <p className="text-danger">{error.newPassword}</p>
                    </div>
                  </div>
                  <div className="form-floating">
                    <div className="icon_parent">
                      <div className="icon_child">
                        <i class="fa fa-lock login_icon" aria-hidden="true"></i>
                      </div>
                    </div>
                    <div className="">
                      <input
                        type="password"
                        onChange={handlechange}
                        placeholder="Confirm password"
                        name="confirmPassword"
                        className="py-2 form-control"
                        style={{ color: "black" }}
                      />
                      <p className="text-danger">{error.confirmPassword}</p>
                    </div>
                  </div>
                  <div className="btnLogin">
                    <button
                      className="btn w-100 shadow rounded login_btn"
                      onClick={handleclick}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bgPosition"></div>
      </section>
      
    </div>
  );
}
