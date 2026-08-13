import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RxCrossCircled } from "react-icons/rx";
import { FaCircleCheck } from "react-icons/fa6";
import { Navigate, useNavigate } from "react-router-dom";
const pageSize = 5
export default function CalculationPages() {
    const [data, setData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()
    const showdata = () => {
        axios.get(`${process.env.REACT_APP_BASE_URL}get-list-clearance-quotation`).then((response) => {
            setData(response.data.data)
        }).catch((error) => {
            toast.error(error.response.data.error)
        })
    }
    useEffect(() => {
        showdata()
    }, [])
    const handleaccept = (clearance_id) => {
        axios
            .post(`${process.env.REACT_APP_BASE_URL}status-clearance`, {
                clearance_id: clearance_id,
                status: 1,
            })
            .then((response) => {
                toast.success(response.data.message);
            })
            .catch((error) => {
                toast.error(error.response.data.message);
            });
    };
    const handlereject = (clearance_id) => {
        axios
            .post(`${process.env.REACT_APP_BASE_URL}status-clearance`, {
                clearance_id: clearance_id,
                status: 2,
            })
            .then((response) => {
                toast.error(response.data.message);
            })
            .catch((error) => {
                toast.error(error.response.data.message);
            });
    };
    //////////////////////////////pegination/////////////////////////////////////////////////////////////////////////////
    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = data.slice(startIndex, endIndex)
    const handlePageChange = (currentData) => {
        setCurrentPage(currentData);
    };
    const handleclickfgdfg = (item) => {
        console.log(item)
        navigate('/Admin/clearencePage', { state: { data: item } })
    }
    return (
        <div className="wpWrapper">
            <div className="container-fluid">
                <div className="card ">
                    <div className="card-body">
                        <div className="row manageFreight">
                            <div className="col-12">
                                <h4 className="freight_hd">Calculate Clearance List</h4>
                            </div>
                        </div>
                        <div className="table-responsive mt-2">
                            <table className="table table-striped tableICon">
                                <thead >
                                    <tr>
                                        <th scope="col">Sr.No.</th>
                                        <th scope="col">HS Tariff</th>
                                        <th scope="col">Value of Good</th>
                                        <th scope="col">Vat%</th>
                                        <th scope="col">Value of Goods</th>
                                        <th scope="col">Quoted Rate</th>
                                        <th scope="col">
                                            Import Duty
                                        </th>
                                        {/* <th scope="col">
                                                View
                                            </th> */}
                                        <th scope="col">
                                            VAT
                                        </th>
                                        <th scope="col">Customs Amount Due</th>
                                        <th scope="col" className="">Action</th>
                                    </tr>
                                </thead>
                                <tbody style={{ border: "none" }}>
                                    {
                                        currentData && currentData.length > 0 && currentData.map((item, index) => {
                                            console.log(item)
                                            return (
                                                <>
                                                    <tr className="border-bottom" key={index}>
                                                        <td >{startIndex + index + 1}</td>
                                                        <td >{item?.HS_tariff_code}</td>
                                                        <td>{item?.goods_value}</td>
                                                        <td>{item?.import_duty_per}</td>
                                                        <td>{item?.quoted_rate}</td>
                                                        <td>{item?.import_duty}</td>
                                                        <td>{item?.vat}</td>
                                                        {/* <td onClick={() => { handleclickfgdfg(item) }}>view clearance</td> */}
                                                        <td>{parseFloat(item?.values_of_good).toFixed(2)}</td>
                                                        <td>{item?.customs_amount_due}</td>
                                                        <td>
                                                            <div className="d-flex">
                                                                <FaCircleCheck style={{ fontSize: "25px", color: "green", fontWeight: "900" }} onClick={() => { handleaccept(item.clearance_id) }} />
                                                                <RxCrossCircled className="text-danger ms-2" onClick={() => { handlereject(item.clearance_id) }} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                            <div className='mt-4'>
                                <button disabled={currentPage === 1} className='btn pagePre' onClick={() => handlePageChange(currentPage - 1)} style={{ backgroundColor: "red", color: "white" }}>
                                    Previous
                                </button>
                                <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                                <button className='btn btn-success pageNext' disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} style={{ backgroundColor: "green", color: "white" }}>
                                    Next
                                </button>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}
