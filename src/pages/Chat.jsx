import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from "react-toastify";export default function Chat() {

    const [sidestata, setSidestata] = useState({})
    const [message, setMessage] = useState({})
    const [error, setError] = useState([])
    const [mssageget, setMssageget] = useState([])
    const user = JSON.parse(localStorage.getItem('data'))
    const location = useLocation()
    const userdata = (location?.state?.alldata[0])

    const getclient = () => {
        axios.post(`${process.env.REACT_APP_BASE_URL}get-messages-list`, { userId: user?.id }).then((response) => {
            setSidestata(response.data.data)
        }).catch((error) => {
            toast.error(error.response.data)
        })
    }

    useEffect(() => {
        getclient()
    }, [])

    // //////////////////////////////////////send messgae //////////////////////////////////////////

    const handlechange = (e) => {
        const { name, value } = e.target
        setMessage({ ...message, [name]: value })
    }

    const handleclcick = () => {
        handlevalidate(message)
    }

    const handlevalidate = (value) => {
        let error = {};
        if (!value.message_text) {
            toast.error("write something in the message")
            error.message_text = "write something"
        } else {
            hitapi()
        }
        setError(error)
    }

    const hitapi = () => {

        const inputdatamessage = {
            sender_id: user?.id,
            receiver_id: userdata?.id,
            message_text: message.message_text
        }

        axios.post(`${process.env.REACT_APP_BASE_URL}sendMessage`, inputdatamessage).then((response) => {
            showmsg()
            toast.success(response.data.message)
            const messagesContainer = document.querySelector(".messages");
            messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
        }).catch((error) => {
         toast.error(error.response)
        })
    }

   //////////// // //////////////////////////////////messgae chat show ////////////////////////

    const showmsg = () => {
        const getmessgae = {
            sender_id: user?.id,
            receiver_id: userdata?.id,
            user_id: user?.id
        }
        axios.post(`${process.env.REACT_APP_BASE_URL}get-all-messages`, getmessgae).then((response) => {
            setMssageget(response.data.data)
        }).catch((error) => {
            console.log(error.response.data.message)
        })
    }
    
    useEffect(() => {
        showmsg()
    }, [])

    return (
        <div>
            <section className="chatBox">
                <div className="container-fluid">
                    <div className="row">
                        <div id="frame">
                            <div id="sidepanel">
                                <div id="profile">
                                    <div className="wrap">
                                        <img
                                            id="profile-img"
                                            src="http://emilcarlsson.se/assets/mikeross.png"
                                            className="online"
                                            alt=""
                                        />
                                        <p>Mike Ross</p>
                                        <i
                                            className="fa fa-chevron-down expand-button"
                                            aria-hidden="true"
                                        />
                                        <div id="status-options">
                                            <ul>
                                                <li id="status-online" className="active">
                                                    <span className="status-circle" />
                                                    <p>Online</p>
                                                </li>
                                                <li id="status-away">
                                                    <span className="status-circle" />
                                                    <p>Away</p>
                                                </li>
                                                <li id="status-busy">
                                                    <span className="status-circle" />
                                                    <p>Busy</p>
                                                </li>
                                                <li id="status-offline">
                                                    <span className="status-circle" />
                                                    <p>Offline</p>
                                                </li>
                                            </ul>
                                        </div>
                                        <div id="expanded">
                                            <label htmlFor="twitter">
                                                <i className="fa fa-facebook fa-fw" aria-hidden="true" />
                                            </label>
                                            <input name="twitter" type="text" defaultValue="mikeross" />
                                            <label htmlFor="twitter">
                                                <i className="fa fa-twitter fa-fw" aria-hidden="true" />
                                            </label>
                                            <input name="twitter" type="text" defaultValue="ross81" />
                                            <label htmlFor="twitter">
                                                <i className="fa fa-instagram fa-fw" aria-hidden="true" />
                                            </label>
                                            <input name="twitter" type="text" defaultValue="mike.ross" />
                                        </div>
                                    </div>
                                </div>
                                <div className="searchManageFre" id="search">
                                    <label htmlFor="">
                                        <i className="fa fa-search" aria-hidden="true" />
                                    </label>
                                    <input type="text" placeholder="Search contacts..." />
                                </div>
                                <div id="contacts">
                                    <ul>
                                        {
                                            sidestata && sidestata.length > 0 && sidestata.map((item, index) => {
                                                return (
                                                    <>
                                                        <li className="contact">
                                                            <div className="wrap">
                                                                <span className="contact-status online" />
                                                                <img
                                                                    src="http://emilcarlsson.se/assets/louislitt.png"
                                                                    alt=""
                                                                />
                                                                <div className="meta">
                                                                    <p className="name">{item?.sender_name}</p>
                                                                    <p className="preview">{item?.is_seen === 0 ? (<p className='preview fw-bold'>{item.message_text}</p>) : (<p className='preview'>{item.message_text}</p>)}</p>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </div>
                            <div className="content">
                                <div className="contact-profile">
                                    <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                                    <p className='text-capitalize'>{userdata.full_name}</p>
                                    <div className="social-media">
                                        <i className="fa fa-facebook" aria-hidden="true" />
                                        <i className="fa fa-twitter" aria-hidden="true" />
                                        <i className="fa fa-instagram" aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="messages">
                                    <ul>
                                        {
                                            mssageget && mssageget.length > 0 && mssageget.map((item) => {
                                                console.log(item)
                                                return (
                                                    <>
                                                        {
                                                            item.sender_id === user?.id ? (
                                                                <li className="replies">
                                                                    <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                                                                    <p>
                                                                        {item.message_text}
                                                                    </p>
                                                                </li>
                                                            ) : (
                                                                <li className="sent">
                                                                    <img
                                                                        src="http://emilcarlsson.se/assets/harveyspecter.png"
                                                                        alt=""
                                                                    />
                                                                    <p>
                                                                        {item.message_text}
                                                                    </p>
                                                                </li>
                                                            )
                                                        }
                                                    </>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                                <div className="message-input">
                                    <div className="wrap">
                                        <input type="text" placeholder="Write your message..." name='message_text' onChange={handlechange} />
                                        <i className="fa fa-paperclip attachment" aria-hidden="true" />
                                        <button className="submit">
                                            <i className="fa fa-paper-plane" aria-hidden="true" onClick={handleclcick} />
                                        </button>
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
