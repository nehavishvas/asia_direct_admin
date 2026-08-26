import { ArrowBack } from "@mui/icons-material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

export default function SupplierEstimation() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state.data
  console.log(id);
  // console.log("location", location.state.data);
  const frightData = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}get-suppler-selected`,
        { freight_id: id }
      );
      console.log("frightDataresponse", response.data);
      setData(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  useEffect(() => {
    frightData();
  }, []);
  const filterdata = data?.filter((item) => {
    return (
      item?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.full_name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.staff_name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
  });
  const totalPages = Math.ceil(filterdata.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filterdata.slice(startIndex, endIndex);

  const handleclicknanvi = (item) => {
    navigate("/Admin/supplier-estimation-view", {
      state: { data: item, freight_id: id, from: location.state?.from },
    });
  };

  const handleclicknav = () => {
    const fromPath = location.state?.from || "/Admin/managefreight";
    navigate(fromPath);
  };
  const querryinQChat = (item) => {
    console.log("item", item);
    navigate("/Admin/QuotationInFreightSupplier", { state: { data: item } });
  };
  
  return (
    <div className="wpWrapper ">
      <div className="container-fluid">
        <div className="table-responsive mt-3">
          <ArrowBack style={{ cursor: "pointer" }} onClick={handleclicknav} />
          <table className="table table-striped tableICon">
            <thead>
              <tr>
                <th scope="col">Sr.No.</th>
                <th scope="col">Full Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone No.</th>
                <th scope="col">Country</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody style={{ border: "none" }}>
              {currentData && currentData.length > 0 ? (
                currentData.map((item, index) => {
                  return (
                    <tr className="border-bottom" key={index}>
                      <td>{startIndex + index + 1}</td>
                      <td>{item?.name}</td>
                      <td>{item?.email}</td>
                      <td>{item?.phone_no}</td>
                      <td>{item?.country_name}</td>
                      <td>
                        <i
                          className="fa fa-eye "
                          onClick={() => {
                            handleclicknanvi(item);
                          }}
                          style={{ cursor: "pointer" }}
                        ></i>
                        <i
                          className="fa fa-comment "
                          onClick={() => {
                            querryinQChat(item);
                          }}
                          style={{ cursor: "pointer" }}
                        ></i>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3">
                    No supplier available for this freight.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}