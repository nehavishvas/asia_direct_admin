import axios from 'axios'
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { toast } from "react-toastify";
import  Img1 from'../../Assests/logotransparent.png';
export default function Forgottenpassword() {
    const [data, setData] = useState("")
    const [error, setError] = useState({})
    const handlechange = (e) => {
        const { name, value } = e.target
        setData({ ...data, [name]: value })
    }
    const handlevalidate = (value) => {
        let error = {};
        if (!value.email) {
            error.email = "Email is required"
            toast.error("Email is required")
        } else {
            apihit()
        }
        setError(error)
    }
    const handlelcikc = () => {
        handlevalidate(data)
    }
    const apihit = () => {
        const postemaiil = {
            email: data.email
        }
        axios.post(`${process.env.REACT_APP_BASE_URL}forgot-password`, postemaiil).then((response) => {
            console.log(response.data.token)
            localStorage.setItem("token",response.data.token)
            toast.success(response.data.msg)
        }).catch((error) => {
            console.log(error.response.data.msg)
            toast.error(error.response.data.msg)
        })
    }
    return (
        <div>
            <section className='loginmain'>
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="d-flex justify-content-center align-items-center">
                                <div class="loginFormMain">
                                    <div class="logoLogin">
                                    <img src={Img1} alt="Logo" />
                                    </div>
                                    <div className="form-floating">
                                        <div className='icon_parent'>
                                            <div className='icon_child'>
                                                <i class="fi fi-ss-user login_icon"></i>
                                            </div>
                                        </div>
                                        <div>
                                        <input type='email' name='email' onChange={handlechange} placeholder='Email' className='form-control py-2' style={{ color: "black", fontWeight: "700" }} />
                                        </div>
                                    </div>
                                    <div class="btnLogin">
                                        <button className='btn w-100 shadow rounded login_btn' onClick={handlelcikc}>Send</button>
                                    </div>
                                    <div className='mt-3 text-center'>
                                    <NavLink to={"/"} className='forget_pass'>Back to Login?</NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </section>
        </div>
    )
}


