import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from "react-toastify";export default function CustomCalculationpage() {
  const [detailsdata, setDetailsdata] = useState({})
  const location = useLocation()
  console.log(location.state.data.id)
  const info = (location?.state?.data.id)
  console.log(info)

useEffect(()=>{
  handleclickfgdfg()
},[])

  const handleclickfgdfg = (item) => {
    axios.post(`${process.env.REACT_APP_BASE_URL}get-calculated-details`, { clearance_id: info }).then((response) => {
     console.log(response.data)
      setDetailsdata(response.data.data)
    }).catch((error) => {
      toast.error(error.response.data.message)
    })
  }
  return (
    <>
    <div className="wpWrapper">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <h4 className='det_hd'>Custom Clearance Details</h4>
          </div>
        </div>
        <div className='card'>
          <div className='card-body'>
            <div className='row'>
              <div className='col-lg-12'>
                <h5 className='hd_basic'>Basic Information</h5>
              </div>
            </div>
            <div className='row'>
              <div className='col'>
                <label className='hd_label'>Clearing agent</label>
                <p className="det_input">{detailsdata?.clearing_agent}</p>
              </div>
              <div className='col'>
                <label className='hd_label'>Clearing result</label>
                <p className="det_input">{detailsdata?.clearing_result}</p>
              </div>
              <div className='col'>
                <label className='hd_label'>Clearing status</label>
                <p className="det_input">{detailsdata?.clearing_result}</p>
              </div>
              <div className='col'>
                <label className='hd_label'>Client</label>
                <p className="det_input">{detailsdata?.client}</p>
              </div>
            </div>
            <div className='row'>
              <div className='col'>
                <label className='hd_label'>Comment_on_docs</label>
                <p className="det_input">{detailsdata?.comment_on_docs}</p>
              </div>
              <div className='col'>
                <label className='hd_label'>Customer_ref</label>
                <p className="det_input">{detailsdata?.customer_ref}</p>
              </div>
              <div className='col'>
                <label className='hd_label'>Destination</label>
                <p className="det_input">{detailsdata?.destination}</p>
              </div>
              <div className='col'>
                <label className='hd_label'>Document_req</label>
                <p className="det_input">{detailsdata?.document_req} </p>
              </div>
            </div>
            <div className="horizontalLine"></div>
            <div className='row'>
              <div className='col'>
                <label className='hd_label'>Document_upload</label>
                <p className="det_input">{detailsdata?.document_upload}</p>
              </div>
              <div className='col'>
                <label className='hd_label'>Goods_desc</label>
                <p className="det_input">{detailsdata?.goods_desc}</p>
              </div>
              <div className='col'>
                <label className='hd_label'>Port_of_entry</label>
                <p className="det_input">{detailsdata?.port_of_entry}</p>
              </div>
              <div className='col'>
                <label className='hd_label'>Port_of_exit</label>
                <p className="det_input">{detailsdata?.port_of_exit} </p>
              </div>
            </div>
            <div className='row'>
              <div className='col'>
                <label className='hd_label'>Sad500</label>
                <p className="det_input">{detailsdata?.sad500}</p>
              </div>
              <div className='col'>
                <label className='hd_label'>Trans_reference</label>
                <p className="det_input">{detailsdata?.trans_reference}</p>
              </div>
            </div>
            <div className="horizontalLine"></div>
          </div>
        </div>
      </div>
    </div>
    < ToastContainer />
    </>
    )}
