import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from "react-toastify";export default function CMS() {
    const [data, setData] = useState({})
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
    useEffect(() => {
        getlibnk()
    }, [])
    return (
        <>
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
                                <div className='text-center'>
                                    <button onClick={handlelcick} type='button' className='link_btn'>Change link</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </>
    )
}
