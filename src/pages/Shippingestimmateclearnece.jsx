import axios from 'axios';
import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
export default function ShippingEstimateClearance() {
    const [data, setData] = useState({});
    const navigate = useNavigate()

    const location = useLocation()
    console.log(location.state.data12)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };
    const finalVal =
        parseFloat(data.importer_vat || 0) +
        parseFloat(data.Customs_Duty || 0) +
        parseFloat(data.Document_Fee || 0) +
        parseFloat(data.Customs_Clearing_fee || 0) +
        parseFloat(data.Disbursement_fee || 0) +
        parseFloat(data.Agency_surcharge || 0);

    const hanldekeypress = (e) => {
        if (e.charCode < 46 || e.charCode > 57) {
            e.preventDefault()
        }
    }

    const handlepostvalue = () => {
        const data12 = {
            clearance_id: location.state.data[0].id,
            import_vat: data.importer_vat,
            customs_duty: data.Customs_Duty,
            agency_surcharge: data.Agency_surcharge,
            disbursement_fee: data.Disbursement_fee,
            customs_clearing_fee: data.Customs_Clearing_fee,
            document_fee: data.Document_Fee,
            final_amount: finalVal
        }
        console.log(data12)
        axios.post(`${process.env.REACT_APP_BASE_URL}calculateClearanceByAdmin`, data12).then((response) => {
            console.log(response.data.message)
            toast.success(response.data.message)
            if (response.data.success) {
                setTimeout(() => {
                    if(location.state)
                    navigate('/Admin/Custom-clearence-byuser')
                }, [1500])
            }
            console.log(response.data)
        }).catch((error) => {
            toast.error(error.response.data)
        })
    }
const handleclicknav =() =>{
    navigate('/Admin/Custom-clearence-byuser')
}
   
    return (
        <div className="wpWrapper sidebar123">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-12 px-0">
                        <div className="d-flex">
                            <div>
                            <ArrowBackIcon
                          onClick={handleclicknav}
                          className="text-dark"
                          style={{ cursor: "pointer" }}
                        />
                            </div>
                            <div>

                            <h4  className="det_hd">Shipping Estimate Clearance</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='card mt-4'>
                    <div className='card-body'>
                        <div className='updateLoading'>
                            <div className="row">
                                <div className="col-md-4">
                                    <label htmlFor="importer_vat">Import VAT</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="importer_vat"
                                        name="importer_vat"
                                        onChange={handleChange}
                                        onKeyPress={hanldekeypress}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="Customs_Duty">Customs Duty</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="Customs_Duty"
                                        name="Customs_Duty"
                                        onChange={handleChange}
                                        onKeyPress={hanldekeypress}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="Agency_surcharge">Agency Surcharge</label>
                                    <input type="number"
                                        className="form-control"
                                        id="Agency_surcharge"
                                        name="Agency_surcharge"
                                        onChange={handleChange}
                                        onKeyPress={hanldekeypress}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <label htmlFor="Disbursement_fee">Disbursement Fee</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="Disbursement_fee"
                                        name="Disbursement_fee"
                                        onChange={handleChange}
                                        onKeyPress={hanldekeypress}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="Customs_Clearing_fee">Customs Clearing Fee</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="Customs_Clearing_fee"
                                        name="Customs_Clearing_fee"
                                        onChange={handleChange}
                                        onKeyPress={hanldekeypress}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="Document_Fee">Document Fee</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="Document_Fee"
                                        name="Document_Fee"
                                        onChange={handleChange}
                                        onKeyPress={hanldekeypress}
                                    />
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col-md-7">
                                    <div className='text-end me-5'>
                                        <button className="btn btn-primary btn-block" onClick={() => { handlepostvalue() }}>Calculate</button>
                                    </div>
                                </div>
                                <div className="col-md-5">
                                    <div className='text-end'>
                                        <h5>Overall Value:<span className="text-success">{finalVal}</span></h5>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}