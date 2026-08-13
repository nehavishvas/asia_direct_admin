import { Box, Button, Modal } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import Swal from "sweetalert2";

const pageSize = 10;
export default function Warehouseview() {
  const location = useLocation();
  const [openmodalorderid, setOpenmodalorderid] = useState(false);
  const [datada1, setDatada1] = useState([]);
  const [datada, setDatada] = useState({});
  const [data,setData]=useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const order_id = location.state?.order_id;
  useEffect(() => {
    getStackedData(order_id);
  }, [order_id]);
  const getStackedData = async (order_id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}getWarehouseOrderById/${order_id}`,
      );
      console.log("API Response:", response.data); 
      setDatada(response.data.data); 
    } catch (error) {
      console.error("Error fetching stacked data:", error);
    }
  };
  const handleChangeOrders = (event) => {
  const {
    target: { value },
  } = event;
  setSelectedOrders(
    typeof value === "string" ? value.split(",") : value
  );
};
  const sections = [
    {
      title: "Basic Info",
      fields: [
        { label: "Client Name", key: "client_name" },
        { label: "Goods", key: "goods_description" },
        { label: "Dimensions", key: "dimensions" },
        { label: "Weight", key: "weight" },
        { label: "Cartons", key: "cartons" },
        { label: "CBM", key: "CBM" },
      ],
    },
    {
      title: "Location Info",
      fields: [
        { label: "Collection From", key: "collection_from_name" },
        { label: "Delivery To", key: "delivery_to_name" },
        { label: "Warehouse No", key: "warehouse_number" },
        { label: "Status", key: "warehouse_status" },
      ],
    },
    {
      title: "Supplier Info",
      fields: [
        { label: "Company", key: "supplier_company" },
        { label: "Person", key: "supplier_person" },
        { label: "Contact", key: "supplier_contact_no" },
        { label: "Address", key: "supplier_address" },
      ],
    },
    {
      title: "Warehouse Services",
      fields: [
        { label: "Collection", key: "warehouse_collect" },
        { label: "Collection Cost", key: "costs_to_collect" },
        { label: "Storage", key: "warehouse_storage" },
        { label: "Storage Cost", key: "warehouse_cost" },
        { label: "Handling", key: "handling_required" },
        { label: "Handling Cost", key: "handling_cost" },
        { label: "Dispatch", key: "warehouse_dispatch" },
        { label: "Dispatch Cost", key: "cost_to_dispatch" },
      ],
    },
    {
      title: "Extra Details",
      fields: [
        { label: "Hazardous", key: "hazardous" },
        { label: "Hazard Description", key: "hazard_description" },
        { label: "Damaged Goods", key: "damage_goods" },
        { label: "Damage Comment", key: "damage_comment" },
        { label: "Box Marking", key: "box_marking" },
        { label: "Customer Ref", key: "customer_ref" },
        { label: "Warehouse Comment", key: "warehouse_comment" },
      ],
    },
  ];
  const handleclick = () => {
    setOpenmodalorderid(true);
  };
  const handleclose = () => {
    setOpenmodalorderid(false);
  };
  useEffect(() => {
    getOrder();
  }, []);
  const getOrder = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}getUnAssignOrderList`,
      );
      if (response.data.success) {
        console.log(response.data.data);
        setDatada1(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
const assignOrderToWarehouse = async () => {
  if (selectedOrders.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "No Orders Selected",
      text: "Please select at least one order",
    });
    return;
  }

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}addOrderToWarehouseProducts`,
      {
        warehouse_order_id:order_id,
        order_numbers: selectedOrders,
      }
    );

    if (response.data.success) {
      getwarehousei()
      Swal.fire({
        icon: "success",
        title: "Success 🎉",
        text: "Order assigned successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      handleclose();
      setSelectedOrders([]); // optional reset
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed ❌",
        text: response.data.message || "Something went wrong",
      });
    }
  } catch (error) {
    console.log(error);

    Swal.fire({
      icon: "error",
      title: "Error ❌",
      text: "Server error. Please try again later",
    });
  }
};
useEffect(()=>{
  getwarehousei()
},[])
const getwarehousei=async()=>{
try {
  const response =await axios.get(`${process.env.REACT_APP_BASE_URL}getProductByWarehouseOrderId/${order_id}`) 
  console.log(response.data)
  if(response.data.success){
    console.log(response.data.data)
    setData(response.data.data)
  } 
} catch (error) {
  console.log(error)
}
}



 const totalPage = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentdata = data.slice(startIndex, endIndex);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        {order_id ? (
          <div className="card shadow-lg p-4">
            {sections.map((section, i) => (
              <div key={i} className="mb-4">
                <h5 className="text-success mb-3">{section.title}</h5>
                <div className="row">
                  {section.fields.map((field, index) => (
                    <div className="col-md-4 mb-3" key={index}>
                      <label className="form-label fw-bold">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={datada?.[field.key] || "N/A"}
                        readOnly
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="d-flex justify-content-between">
              <div>
                <h5>Assign order to warehouse</h5>
              </div>
              <div>
                <Button variant="contained" onClick={handleclick}>
                  Assign Order
                </Button>
              </div>
            </div>
              <div className="row">
                {/* <h5>Order's in Warehouse</h5> */}
                 <div className="table-responsive mt-3">
                                  <table className="table table-striped tableICon">
                                    <thead>
                                      <tr>
                                        <th>Sr.No.</th>
                                        <th>Supplier Company</th>
                                        <th>Product Description</th>
                                        <th>Package Type</th>
                                        <th>Packages</th>
                                        <th>Dimension</th>
                                        <th>Weight</th>
                                        {/* <th>Action</th> */}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {currentdata &&
                                        currentdata.length > 0 &&
                                        currentdata.map((item, index) => (
                                          <tr key={item.id}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.supplier}</td>
                                            <td>{item.product_description}</td>
                                            <td>{item.package_type}</td>
                                            <td>{item.packages}</td>
                                            <td>{item.dimension}</td>
                                            <td>{item.weight}</td>
                                            {/* <td>
                                             <VisibilityIcon
                                                onClick={() => {  
                                                  openMsendnaaa(item.warehouse_id);
                
                                                }}
                                                style={{
                                                  color: "rgb(27 34 69)",
                                                  marginRight: "10px",
                                                  width: "20px",
                                                  height: "15px",
                                                  cursor: "pointer",
                                                }}
                                              />
                                              <FaEdit
                                                onClick={() => {
                                                  openModal2(item.order_id);
                                                }}
                                                style={{
                                                  color: "rgb(27 34 69)",
                                                  marginRight: "10px",
                                                  width: "20px",
                                                  height: "15px",
                                                  cursor: "pointer",
                                                }}
                                              />
                                              <AiFillDelete
                                                onClick={() => {
                                                  deletewarehouse(item.id);
                                                }}
                                                style={{
                                                  color: "rgb(27 34 69)",
                                                  marginRight: "10px",
                                                  width: "20px",
                                                  height: "15px",
                                                  cursor: "pointer",
                                                }}
                                              />
                                            </td> */}
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  <div className="text-center d-flex justify-content-end align-items-center">
                                    <button
                                      disabled={currentPage === 1}
                                      className="bg_page"
                                      onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                      <i class="fi fi-rr-angle-small-left page_icon"></i>
                                    </button>
                                    <span className="mx-2">{`Page ${currentPage} of ${totalPage}`}</span>
                                    <button
                                      disabled={currentPage === totalPage}
                                      className="bg_page"
                                      onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                      <i class="fi fi-rr-angle-small-right page_icon"></i>
                                    </button>
                                  </div>
                                                              
                                  
                                </div>
                </div>
            <Modal
              open={openmodalorderid}
              onClose={handleclose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box
                className="warehouse_modal"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                }}
              >
                <div className="modal-header">
                  <h2 id="modal-modal-title">Add Warehouse</h2>
                  <button className="btn btn-close" onClick={handleclose}>
                    <CloseIcon />
                  </button>
                </div>
                <div className="newModalGap noFormaControl">
                  <label>Select Order</label>
                  {/* <select>
                    <option>select</option>
                    {datada1.map((item) => {
                      return (
                        // ["test work can we delete"]() 
                        <>
                          <option
                            onClick={() => {
                              handleclckkVal(item.order_number);
                            }}
                          >
                            {item.order_number}
                          </option>
                        </>
                      );
                    })}
                  </select> */}
                 <FormControl fullWidth>
  <InputLabel>Select Orders</InputLabel>
  <Select
    multiple
    value={selectedOrders}
    onChange={handleChangeOrders}
    input={<OutlinedInput label="Select Orders" />}
    renderValue={(selected) => selected.join(", ")}
  >
    {datada1.map((item, index) => (
      <MenuItem key={index} value={item.order_number}>
        <Checkbox checked={selectedOrders.indexOf(item.order_number) > -1} />
        <ListItemText primary={item.order_number} />
      </MenuItem>
    ))}
  </Select>
</FormControl>
               <Button variant="contained" onClick={assignOrderToWarehouse}>
  Save
</Button>
                </div>
              </Box>
            </Modal>
          </div>
        ) : (
          <h3 className="text-danger">No Order ID provided.</h3>
        )}
      </div>
    </div>
  );
}
