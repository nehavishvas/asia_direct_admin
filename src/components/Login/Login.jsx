import axios from "axios";
import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MyContext1 } from "../../Context/MyContext";
import Img1 from "../../Assests/logotransparent.png";
import axiosInstance from "../../axiosInstance";
export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState({});
  const { text, setText } = useContext(MyContext1);
  const navigate = useNavigate();
  console.log(axiosInstance);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };
  const handleKey = (e) => {
    if (e.key === "Enter") {
      handleValidate(data);
    }
  };
  const handleValidate = (value) => {
    let errors = {};
    if (!value.email) {
      errors.email = "Email is required";
      toast.error("Email is required");
    }
    if (!value.password) {
      errors.password = "Password is required";
      toast.error("Password is required");
    }
    if (!errors.email && !errors.password) {
      apiHit();
    }
    setError(errors);
  };
  const handleClick = () => {
    handleValidate(data);
  };
  const apiHit = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}admin-login`,
        data
      );
      setText(response.data.data.profile);
      getpermission();
      if (response.status === 200) {
        localStorage.setItem("data123", JSON.stringify(response.data.data));
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/Admin/dashboard");
        }, [500]);
      } else {
        toast.error("API not found");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };
  const getpermission = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}GetAllPermissions`
      );
      const data = response.data.data;
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <section className="loginmain">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="d-flex justify-content-center align-items-center">
                <div className="loginFormMain">
                  <div className="logoLogin">
                    <img src={Img1} alt="Logo" />
                  </div>
                  <div className="form-floating mb-2">
                    <div className="icon_parent">
                      <div className="icon_child">
                        <i class="fi fi-ss-user login_icon"></i>
                      </div>
                    </div>
                    <div className="">
                      <input
                        type="email"
                        name="email"
                        onChange={handleChange}
                        onKeyDown={handleKey}
                        placeholder="Email"
                        className="py-2 form-control"
                        style={{ color: "black", fontWeight: "700" }}
                      />
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
                        name="password"
                        onChange={handleChange}
                        onKeyDown={handleKey}
                        placeholder="Password"
                        className="py-2 form-control"
                        style={{ color: "black" }}
                      />
                    </div>
                  </div>
                  <div className="btnLogin">
                    <button
                      className="btn w-100 shadow rounded login_btn"
                      onClick={handleClick}
                    >
                      {" "}
                      Login
                    </button>
                  </div>
                  <div className="mt-3">
                    <NavLink to="/forgoten-password" className="forget_pass">
                      Forgot Password?
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </section>
    </>
  );
}
