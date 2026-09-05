import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from "react-toastify";

export default function CMS() {
    const [data, setData] = useState({})
    const [hasPermission, setHasPermission] = useState(null);
    const [loader, setLoader] = useState(false);
    const handlechange = (e) => {
        const { name, value } = e.target
        setData({ ...data, [name]: value })
    }
    const handlelcick = () => {
        axios.post(`${process.env.REACT_APP_BASE_URL}social-media-links`, data).then((response) => {
            toast.success(response.data.message)
        }).catch((error) => {
            toast.error(error.response.data.message)
        })
    }
    const getlibnk = () => {
        axios.get(`${process.env.REACT_APP_BASE_URL}get-social-links`).then((response) => {
            setData(response.data.data)
        }).catch((error) => {
            toast.error(error.response.data)
        })
    }
    const userid = JSON.parse(localStorage.getItem("data123"))?.id;
    const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;

    const checkPermission = async () => {
        try {
            setLoader(true);
            if (!userid || !usertype) {
                setHasPermission(false);
                return;
            }
            const checkPost = {
                staff_id: userid,
                user_type: usertype,
                route_url: "/Admin/link",
            };
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                checkPost
            );
            if (response.data && response.data.success === true) {
                setHasPermission(true);
                getlibnk();
            } else {
                setHasPermission(false);
                toast.error("Permission Denied: You don't have access to this page");
            }
        } catch (error) {
            console.error("Error checking permission:", error);
            setHasPermission(false);
            toast.error(
                error.response?.data?.message || "Permission Denied: You don't have access to this page"
            );
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        checkPermission();
    }, []);
    return (
        <>
            {hasPermission === null ? (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p className="loader-text">Loading...</p>
                </div>
            ) : hasPermission === false ? (
                <div className="wpWrapper">
                    <div className="container-fluid">
                        <div className="row manageFreight">
                            <div className="col-12">
                                <div className="d-flex ">
                                    <div>
                                        <h4 className="freight_hd">Add Links</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center mt-5">
                            <h3 className="text-danger">You don't have permission to access this page</h3>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="wpWrapper">
                    <div className="container-fluid">
                        <div className="row manageFreight">
                            <div className="col-12">
                                <div className="d-flex ">
                                    <div>
                                        <h4 className="freight_hd">Add Links</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card mt-4">
                            <div className="card-body">
                                <div className='link_card'>
                                    <div className='row updateLoading'>
                                        <div className="col-4">
                                            <label for="floatingInput">Facebook Link:</label>
                                            <input type="email" class="form-control" name='facebook_link' onChange={handlechange} value={data?.facebook_link} id="floatingInput" placeholder="http://facebook.com" />
                                            <label className='noneInside' for="floatingInput">Facebook Link (URL):</label>
                                        </div>
                                        <div className="col-4">
                                            <label for="floatingInput">Instagram Link:</label>
                                            <input type="email" class="form-control" onChange={handlechange} name='instagram_link' value={data?.instagram_link} id="floatingInput" placeholder="http://instagram.com" />
                                            <label className='noneInside' for="floatingInput">Instagram Link (URL):</label>
                                        </div>
                                        <div className="col-4">
                                            <label for="floatingInput">Twitter Link:</label>
                                            <input type="email" class="form-control" onChange={handlechange} name='twitter_link' value={data?.twitter_link} id="floatingInput" placeholder="http://Twitter.com" />
                                            <label className='noneInside' for="floatingInput">Twitter Link</label>
                                        </div>
                                    </div>
                                    <div className="row updateLoading ">
                                        <div className="col-4">
                                            <label for="floatingInput">Linkedin Link:</label>
                                            <input type="email" class="form-control" onChange={handlechange} name='linkedin_link' value={data?.linkedin_link} id="floatingInput" placeholder="http://Linkedin.com" />
                                            <label className='noneInside' for="floatingInput">Linkedin Link</label>
                                        </div>
                                        <div className="col-4">
                                            <label for="floatingInput">Youtube Link:</label>
                                            <input type="email" class="form-control" onChange={handlechange} name='youtube_link' value={data?.youtube_link} id="floatingInput" placeholder="http://Youtube.com" />
                                            <label className='noneInside' for="floatingInput">Youtube Link</label>
                                        </div>
                                    </div>
                                    <div className='text-center mt-2'>
                                        <button onClick={handlelcick} type='button' className='link_btn'>Change link</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
