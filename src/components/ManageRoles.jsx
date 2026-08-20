import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Box, Button, Modal } from "@mui/material";
import { FaEdit } from "react-icons/fa";
const pageSize = 10;
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
export default function ManageRoles() {
  const [isChecked, setIsChecked] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputdata, setInputdata] = useState([]);
  const [error, setError] = useState({});
  const [loader, setLoader] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [input, setInput] = useState({
    staff_email: "",
    staff_name: "",
    new_password: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = React.useState([]);
  const filterdata = data?.filter((item) => {
    console.log(item)
    return (
      item?.role_name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
  });
  const totalPages = Math.ceil(filterdata.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filterdata.slice(startIndex, endIndex);
  const getdata = () => {
    setLoader(true);
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetRoles`)
      .then((response) => {
        setLoader(false);
        console.log(response.data.roles);
        setData(response.data.roles);
      })
      .catch((error) => {
        setLoader(false);
        console.log(error.response);
      });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  useEffect(() => {
    getdata();
  }, []);
  const handlechange = (e) => {
    const { name, value } = e.target;
    setInput((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleToggle = (id) => {
    const updatedData = data.map((item) =>
      item.id === id ? { ...item, status: 1 - item.status } : item
    );
    setData(updatedData);
  };
  const handlelcicckac = (id) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}change-status`, {
        user_id: id,
      })
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.log(error.response);
      });
  };
  const handlevalidate = (value) => {
    let error = {};
   
    if (!value.role_name) {
      error.role_name = "Please Add Role Name";
    }
    setError(error);
    if (Object.keys(error).length === 0) {
      handleapi();
    }
  };
  const roleOptions = [
    { value: "0", label: "No Role Assign" },
    { value: "1", label: "Quoting Team" },
    { value: "2", label: "Operation controller" },
    { value: "3", label: "Customs Clearing" },
    { value: "4", label: "Sales Team" },
    { value: "5", label: "Customer Service" },
    { value: "6", label: "Shipping Controller" },
    { value: "7", label: "Warehousing" },
    { value: "8", label: "Accounts" },
  ];
  const handleRoleChange = (event) => {
    setSelectedRoles(event.target.value);
  };
  const handleapi = () => {
    const apivali = {
      role_name: input.role_name
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}AddRoles`, apivali)
      .then((response) => {
        toast.success(response.data.message);
        getdata();
        setIsModalOpen(false);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handleclick = () => {
    handlevalidate(input);
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handledelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(`${process.env.REACT_APP_BASE_URL}delete-staff`, {
            staff_id: id,
          })
          .then((response) => {
            toast.success(response.data.message);
            getdata();
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });
      }
    });
  };
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleupdateapi = (e) => {
    const { name, value } = e.target;
    setInputdata({ ...inputdata, [name]: value });
  };
  const openModal2 = (id) => {
    const userlog = data.find((item) => item.id === id);
    if (userlog) {
      setInputdata({
        staff_id: id,
        staff_email: userlog.email,
        staff_name: userlog.full_name,
        roles: userlog.roles || [],
      });
    }
    setIsModalOpen2(true);
  };
  const postData1234 = () => {
    console.log(inputdata);
    const apivali = {
      staff_id: inputdata.staff_id,
      email: inputdata.staff_email,
      staff_name: inputdata.staff_name,
      roles: selectedRoles,
      password: inputdata.new_password,
    };
    if (!selectedRoles || !inputdata.new_password) {
      toast.error("Update Roles and Password");
    } else {
      axios
        .post(`${process.env.REACT_APP_BASE_URL}update-staff`, apivali)
        .then((response) => {
          toast.success(response.data.message);
          closeModal2();
          getdata();
          setIsModalOpen(false);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    }
  };
  const closeModal2 = () => {
    setIsModalOpen2(false);
  };
  return (
    <>
      {loader ? (
        <div class="loader-container">
          <div class="loader"></div>
          <p class="loader-text">Updating... This may take some time</p>
        </div>
      ) : (
        <>
          <div className="wpWrapper">
            <div className="container-fluid">
              <div className="card">
                <div className="card-body">
                  <div className="row manageFreight">
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="">
                          <h4 className="freight_hd">Add Role</h4>
                        </div>
                        <div className="d-flex justify-content-end align-items-center">
                          <div className="searchManageFre">
                            <input
                              className="px-2 py-1 rounded "
                              type="text"
                              placeholder="Search"

                              value={searchQuery}
                              onChange={handleSearch}
                            ></input>
                           
                          </div>
                          <div className="ms-2">
                            <button type="button" onClick={openModal}>
                              Add Role
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isModalOpen && (
                    <div className="custom-modal">
                      <div className="custom-modal-content">
                        <div className="custom-modal-header">
                          <h5 className="custom-modal-title">Add Role</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={closeModal}
                          />
                        </div>
                        <div className="custom-modal-body">
                          <div>
                            <label
                              htmlFor="inputPassword"
                              className="form-label mb-2 md_staff"
                            >
                              Role Name
                            </label>
                            <div className="col-sm-12">
                              <input
                                type="text"
                                className="form-control"
                                name="role_name"
                                onChange={handlechange}
                                id="inputPassword"
                                placeholder="Role Name"
                              />
                              <p className="text-danger mb-0">{error.role_name}</p>
                            </div>
                          </div>
                        </div>
                        <div className="custom-modal-footer">
                          <button
                            type="button"
                            className="btn text-white"
                            onClick={handleclick}
                            style={{ backgroundColor: "#1b2245" }}
                          >
                            Add Role
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="table-responsive mt-2">
                    <table className="table table-striped tableICon">
                      <thead>
                        <tr>
                          <th scope="col">Sr.No.</th>
                          <th scope="col">Full Name</th>
                          {/* <th scope="col">Status</th> */}
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody style={{ border: "none" }}>
                        {currentData &&
                          currentData.length > 0 &&
                          currentData.map((item, index) => {
                            return (
                              <tr className="border-bottom" key={index}>
                                <th>{startIndex + index + 1}</th>
                                <td>{item.role_name}</td>
                               
                                <td>
                                  <div className="action_btn1 d-flex align-items-center">
                                    <FaEdit
                                      onClick={() => {
                                        openModal2(item.id);
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
                                      className="text-danger"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        handledelete(item.id);
                                      }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
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
                      <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                      <button
                        disabled={currentPage === totalPages}
                        className="bg_page"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <i class="fi fi-rr-angle-small-right page_icon"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <Modal
                  open={isModalOpen2}
                  onClose={closeModal2}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      height: 200,
                      width: 450,
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      p: 4,
                    }}
                  >
                    <div className="row">
                      
                    </div>
                    <div className="row">
                      
                    </div>
                    <div className="row mb-3 ">
                      <div className="col-12">
                        <label htmlFor="multipleSelect" className="ware_label">
                          Assign Roles
                        </label>
                        <br />
                        <FormControl className="w-100">
                          <InputLabel id="roles-label">Roles</InputLabel>
                          <Select
                            labelId="roles-label"
                            multiple
                            value={selectedRoles}
                            onChange={handleRoleChange}
                            input={<OutlinedInput label="Roles" />}
                            renderValue={(selected) =>
                              selected
                                .map(
                                  (role) =>
                                    roleOptions.find(
                                      (option) => option.value === role
                                    )?.label
                                )
                                .join(", ")
                            }
                            MenuProps={MenuProps}
                            className="country_sel"
                          >
                            {roleOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                <Checkbox
                                  checked={
                                    selectedRoles.indexOf(option.value) > -1
                                  }
                                />
                                <ListItemText primary={option.label} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {error.roles && (
                          <p className="text-danger mb-0">{error.roles}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <Button
                        variant="contained"
                        className="submit_btn"
                        onClick={postData1234}
                      >
                        Submit
                      </Button>
                    </div>
                  </Box>
                </Modal>
              </div>
            </div>
          </div>
          
        </>
      )}
    </>
  );
}
// import React, { useState } from "react";

// const initialData = [
//   {
//     id: 1,
//     name: "Category 1",
//     children: [
//       { id: 11, name: "Subcategory 1-1" },
//       { id: 12, name: "Subcategory 1-2" },
//     ],
//   },
//   {
//     id: 2,
//     name: "Category 2",
//     children: [
//       { id: 21, name: "Subcategory 2-1" },
//       { id: 22, name: "Subcategory 2-2" },
//     ],
//   },
// ];

// const TreeNode = ({ node, checkedItems, setCheckedItems }) => {
//   const [expanded, setExpanded] = useState(false);

//   const isChecked = (id) => checkedItems.includes(id);
//   const areAllChildrenChecked = (children) =>
//     children.every((child) => checkedItems.includes(child.id));

//   const handleCheckboxChange = (id, children = []) => {
//     let updatedCheckedItems = [...checkedItems];

//     if (isChecked(id)) {
//       // Uncheck parent and all children
//       updatedCheckedItems = updatedCheckedItems.filter(
//         (item) => item !== id && !children.some((child) => child.id === item)
//       );
//     } else {
//       // Check parent and all children
//       updatedCheckedItems.push(id);
//       children.forEach((child) => updatedCheckedItems.push(child.id));
//     }

//     setCheckedItems(updatedCheckedItems);
//   };

//   const handleChildChange = (childId) => {
//     let updatedCheckedItems = [...checkedItems];

//     if (isChecked(childId)) {
//       updatedCheckedItems = updatedCheckedItems.filter((item) => item !== childId);
//     } else {
//       updatedCheckedItems.push(childId);
//     }

//     // If all children are selected, select the parent
//     if (node.children && areAllChildrenChecked(node.children)) {
//       updatedCheckedItems.push(node.id);
//     } else {
//       updatedCheckedItems = updatedCheckedItems.filter((item) => item !== node.id);
//     }

//     setCheckedItems(updatedCheckedItems);
//   };

//   return (
//     <div style={{ marginLeft: "20px" }}>
//       <div style={{ display: "flex", alignItems: "center" }}>
//         {node.children && (
//           <span
//             onClick={() => setExpanded(!expanded)}
//             style={{ cursor: "pointer", marginRight: "8px" }}
//           >
//             {expanded ? "🔽" : "▶️"}
//           </span>
//         )}
//         <input
//           type="checkbox"
//           checked={isChecked(node.id)}
//           onChange={() => handleCheckboxChange(node.id, node.children || [])}
//         />
//         {node.name}
//       </div>
//       {expanded &&
//         node.children &&
//         node.children.map((child) => (
//           <TreeNode
//             key={child.id}
//             node={child}
//             checkedItems={checkedItems}
//             setCheckedItems={handleChildChange}
//           />
//         ))}
//     </div>
//   );
// };

// const ManageRoles = () => {
//   const [checkedItems, setCheckedItems] = useState([]);

//   return (
//     <div>
//       <h2>Custom Tree View</h2>
//       {initialData.map((node) => (
//         <TreeNode
//           key={node.id}
//           node={node}
//           checkedItems={checkedItems}
//           setCheckedItems={setCheckedItems}
//         />
//       ))}
//       <h3>Selected Items: {JSON.stringify(checkedItems)}</h3>
//     </div>
//   );
// };

// export default ManageRoles;
