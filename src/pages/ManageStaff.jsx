import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import React, { useEffect, useState } from "react";
import { AiFillDelete, AiFillMessage } from "react-icons/ai";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Box, Button, Modal } from "@mui/material";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
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
const countries = [
  { id: "202", name: "South Africa" },
  { id: "246", name: "Zimbabwe" },
  { id: "245", name: "Zambia" },
];
export default function ManageStaff() {
  const [isChecked, setIsChecked] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputdata, setInputdata] = useState([]);
  const [error, setError] = useState({});
  const [open, setOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [loader, setLoader] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [updatedata, setUpdatedata] = useState([]);
  const [pagenationData, setPagenationData] = useState(1);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [input, setInput] = useState({
    staff_email: "",
    staff_name: "",
    new_password: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = React.useState([]);
  const navigate = useNavigate();
  const filterdata = data?.filter((item) => {
    return (
      item?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.full_name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.staff_name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
  });
  const totalPages = Math.ceil(pagenationData.total / pagenationData.limit);
  const startIndex = (currentPage - 1) * pagenationData.limit;
  const endIndex = startIndex + pagenationData.limit;
  const currentData = filterdata.slice(startIndex, endIndex);
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;
  // const getdata = (pageSize) => {
  //   setLoader(true);
  //   const payload = {
  //     page: pageSize,
  //   };
  //   axios
  //     .post(`${process.env.REACT_APP_BASE_URL}new-staff-list`, payload)
  //     .then((response) => {
  //       setLoader(false);
  //       setData(response.data.data);
  //       setPagenationData(response.data);
  //     })
  //     .catch((error) => {
  //       setLoader(false);
  //       console.log(error.response);
  //     });
  // };
  // const getdata = async (pageSize) => {
  //   setLoader(true);

  //   try {
  //     // Permission Check API
  //     const permissionPayload = {
  //       route_url: "/new-staff-list",
  //       staff_id: userid, // dynamic id lagao
  //       user_type: usertype,
  //     };

  //     const permissionRes = await axios.post(
  //       "https://sisccltd.com/api/CheckPermission",
  //       permissionPayload
  //     );

  //     // Permission Success Check
  //     if (permissionRes.data?.success) {
  //       const payload = {
  //         page: pageSize,
  //       };

  //       const response = await axios.post(
  //         `${process.env.REACT_APP_BASE_URL}new-staff-list`,
  //         payload
  //       );

  //       setData(response.data.data);
  //       setPagenationData(response.data);
  //     } else {
  //       alert("You do not have permission to access this page.");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoader(false);
  //   }
  // };
  // const getdata = async (pageSize) => {
  //   setLoader(true);

  //   try {
  //     const permissionPayload = {
  //       route_url: "/new-staff-list",
  //       staff_id: userid,
  //       user_type: usertype,
  //     };

  //     const permissionRes = await axios.post(
  //       "https://sisccltd.com/api/CheckPermission",
  //       permissionPayload
  //     );

  //     if (permissionRes.data?.success) {
  //       const response = await axios.post(
  //         `${process.env.REACT_APP_BASE_URL}new-staff-list`,
  //         {
  //           page: pageSize,
  //         }
  //       );

  //       setData(response.data.data);
  //       setPagenationData(response.data);
  //     } else {
  //       alert(
  //         permissionRes.data?.message ||
  //         permissionRes.data?.error ||
  //         "Permission Denied"
  //       );
  //     }
  //   } catch (error) {
  //     console.log("Full Error:", error);
  //     console.log("Response Data:", error?.response?.data);

  //     alert(
  //       error?.response?.data?.message ||
  //       error?.response?.data?.error ||
  //       JSON.stringify(error?.response?.data) ||
  //       error.message
  //     );
  //   } finally {
  //     setLoader(false);
  //   }
  // };

  const getdata = async (pageSize) => {
    setLoader(true);

    try {
      const permissionPayload = {
        route_url: "/new-staff-list",
        staff_id: userid,
        user_type: usertype,
      };

      const permissionRes = await axios.post(
        "https://sisccltd.com/api/CheckPermission",
        permissionPayload
      );

      if (permissionRes.data?.success) {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}new-staff-list`,
          { page: pageSize }
        );

        setData(response.data.data);
        setPagenationData(response.data);
      } else {
        toast.error(
          permissionRes.data?.message ||
          permissionRes.data?.error ||
          "Permission Denied"
        );
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong"
      );
    } finally {
      setLoader(false);
    }
  };

  const getdata1 = (pageSize) => {
    setLoader(true);
    const payload = {
      search: pageSize,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}new-staff-list`, payload)
      .then((response) => {
        setLoader(false);
        setData(response.data.data);
        setPagenationData(response.data);
      })
      .catch((error) => {
        setLoader(false);
        console.log(error.response);
      });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getdata(page);
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
      item.id === id ? { ...item, status: 1 - item.status } : item,
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

    // Email
    if (!value.staff_email) {
      error.staff_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(value.staff_email)) {
      error.staff_email = "Invalid email format";
    }

    // Name
    if (!value.staff_name) {
      error.staff_name = "Name is required";
    }

    // Password
    if (!value.new_password) {
      error.new_password = "Password is required";
    } else if (value.new_password.length < 6) {
      error.new_password = "Password must be at least 6 characters";
    }

    // Country
    if (!value.country) {
      error.country = "Country is required";
    }

    // Country Code
    if (!value.country_code) {
      error.country_code = "Country code is required";
    }

    // Phone Number
    if (!value.phone_no) {
      error.phone_no = "Phone number is required";
    } else if (!/^[0-9]{7,15}$/.test(value.phone_no)) {
      error.phone_no = "Invalid phone number";
    }

    // Roles
    if (selectedRoles.length === 0) {
      error.roles = "Please select at least one role";
    }

    // Access Country
    if (selectedCountries.length === 0) {
      error.access_country = "Select at least one country";
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
    const value = event.target.value;
    if (value.includes("all")) {
      const allSelected = selectedRoles.length === roleOptions.length;
      setSelectedRoles(allSelected ? [] : roleOptions.map((opt) => opt.value));
    } else {
      setSelectedRoles(value);
    }
  };
  const isAllSelected =
    roleOptions.length > 0 && selectedRoles.length === roleOptions.length;
  // const handleapi = () => {
  //   console.log(input);
  //   console.log("a");
  //   const apivali = {
  //     staff_email: input.staff_email,
  //     staff_name: input.staff_name,
  //     roles: selectedRoles,
  //     new_password: input.new_password,
  //     country: input.country,
  //     country_code: input.country_code,
  //     phone_no: input.phone_no,
  //     access_country: selectedCountries,
  //   };
  //   console.log(apivali);
  //   axios
  //     .post(`${process.env.REACT_APP_BASE_URL}add-staff`, apivali)
  //     .then((response) => {
  //       toast.success(response.data.message);
  //       getdata();
  //       setIsModalOpen(false);
  //     })
  //     .catch((error) => {
  //       toast.error(error.response.data.message);
  //     });
  // };

  const handleapi = async () => {
    console.log(input);
    console.log("a");

    const apivali = {
      staff_email: input.staff_email,
      staff_name: input.staff_name,
      roles: selectedRoles,
      new_password: input.new_password,
      country: input.country,
      country_code: input.country_code,
      phone_no: input.phone_no,
      access_country: selectedCountries,
    };

    console.log(apivali);

    try {
      const permissionRes = await axios.post(
        "https://sisccltd.com/api/CheckPermission",
        {
          route_url: "/add-staff",
          staff_id: userid,
          user_type: usertype,
        }
      );

      if (permissionRes.data?.success) {
        axios
          .post(`${process.env.REACT_APP_BASE_URL}add-staff`, apivali)
          .then((response) => {
            toast.success(response.data.message);
            getdata();
            setIsModalOpen(false);
          })
          .catch((error) => {
            toast.error(error.response?.data?.message);
          });
      } else {
        toast.error(
          permissionRes.data?.message ||
          permissionRes.data?.error ||
          "Permission Denied"
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
      );
    }
  };

  const handleclick = () => {
    handlevalidate(input);
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    getdata1(e.target.value);
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const permissionRes = await axios.post(
            "https://sisccltd.com/api/CheckPermission",
            {
              route_url: "/delete-staff",
              staff_id: userid,
              user_type: usertype,
            }
          );

          if (permissionRes.data?.success) {
            axios
              .post(`${process.env.REACT_APP_BASE_URL}delete-staff`, {
                staff_id: id,
              })
              .then((response) => {
                toast.success(response.data.message);
                getdata();

                Swal.fire({
                  title: "Deleted!",
                  text: "Your file has been deleted.",
                  icon: "success",
                });
              })
              .catch((error) => {
                toast.error(error.response?.data?.message);
              });
          } else {
            toast.error(
              permissionRes.data?.message ||
              permissionRes.data?.error ||
              "Permission Denied"
            );
          }
        } catch (error) {
          toast.error(
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong"
          );
        }
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
    console.log(inputdata);
    console.log(e.target);
  };
  const openModal2 = (id) => {
    const userlog = data.find((item) => item.id === id);

    if (userlog) {
      setInputdata({
        staff_id: id,
        staff_email: userlog.email,
        staff_name: userlog.full_name,
        country: userlog.country,
        country_code: userlog.country_code,
        phone_no: userlog.phone_no,
        new_password: "",
      });

      // Map assigned_roles (or roles fallback) to selectedRoles state
      const rolesList = userlog.assigned_roles || userlog.roles || [];
      setSelectedRoles(rolesList.map((r) => String(r)));
      const countryList = userlog.access_country || [];
      setSelectedCountries(countryList.map((c) => String(c)));
    }

    setIsModalOpen2(true);
  };

  // const openModal2 = (id) => {
  //   const userlog = data.find((item) => item.id === id);
  //   console.log(userlog)
  //   if (userlog) {
  //     setInputdata({
  //       staff_id: id,
  //       staff_email: userlog.email,
  //       staff_name: userlog.full_name,
  //       roles: userlog.roles || [],
  //       country: userlog.country,
  //       country_code: userlog.country_code,
  //     });
  //   }
  //   console.log(userlog);
  //   setIsModalOpen2(true);
  // };
  const postData1234 = async () => {
    console.log(inputdata);

    const apivali = {
      staff_id: inputdata.staff_id,
      email: inputdata.staff_email,
      staff_name: inputdata.staff_name,
      roles: selectedRoles,
      country_code: inputdata.country_code,
      access_country: selectedCountries,
      password: inputdata.new_password,
      country: inputdata.country,
    };

    try {
      const permissionRes = await axios.post(
        "https://sisccltd.com/api/CheckPermission",
        {
          route_url: "/update-staff",
          staff_id: userid,
          user_type: usertype,
        }
      );

      if (permissionRes.data?.success) {
        axios
          .post(`${process.env.REACT_APP_BASE_URL}update-staff`, apivali)
          .then((response) => {
            toast.success(response.data.message);
            closeModal2();
            getdata();
            setIsModalOpen(false);
          })
          .catch((error) => {
            toast.error(error.response?.data?.message);
          });
      } else {
        toast.error(
          permissionRes.data?.message ||
          permissionRes.data?.error ||
          "Permission Denied"
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
      );
    }
    // if (!selectedRoles) {
    //   toast.error("Update Roles is required");
    // } else {

    // }
  };
  const closeModal2 = () => {
    setIsModalOpen2(false);
  };
  const handleclicknavigate = (item) => {
    navigate(`/Admin/staff-details`, { state: { data: item } });
  };
  const querryinQuote = (item) => {
    console.log("item", item);
    navigate("/Admin/QuotationInFreight", { state: { data: item } });
  };

  const updatecountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        console.log(response.data.data);
        setUpdatedata(response.data.data);
      })
      .catch((error) => {
        console.group(error.response.data.message);
      });
  };
  useEffect(() => {
    updatecountry();
  }, []);
  const handleclickKPI = (item) => {
    navigate("/Admin/KPIDashboard");
  };
  const toggleDropdown = () => {
    setOpen(!open);
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedCountries([...selectedCountries, value]);
    } else {
      setSelectedCountries(selectedCountries.filter((id) => id !== value));
    }
  };

  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div>
            <div>
              <div className="row manageFreight">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="">
                      <h4 className="freight_hd">Add Staff</h4>
                    </div>
                    <div className="d-flex justify-content-end align-items-center">
                      <div className="">
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
                          Add
                        </button>
                      </div>
                      <div className="ms-2">
                        <button type="button" onClick={handleclickKPI}>
                          Leave Request
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
                      <h5 className="custom-modal-title">Add Staff</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeModal}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    <div className="custom-modal-body">
                      <div className="row d-flex">
                        <div className="mb-3 col-6">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label mb-2 md_staff"
                          >
                            Email address
                          </label>
                          <div className="col-12">
                            <input
                              type="email"
                              className="form-control"
                              id="exampleFormControlInput1"
                              placeholder="name@example.com"
                              onChange={handlechange}
                              name="staff_email"
                            />
                            <p className="text-danger">{error.staff_email}</p>
                          </div>
                        </div>
                        <div className="mb-3 col-6">
                          <label
                            htmlFor="inputText"
                            className="form-label mb-2 md_staff"
                          >
                            Full Name
                          </label>
                          <div className="col-sm-12">
                            <input
                              type="text"
                              onChange={handlechange}
                              name="staff_name"
                              className="form-control"
                              id="inputText"
                              placeholder="Enter your Name"
                            />
                            <p className="text-danger">{error.staff_name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-6">
                          <label>Country</label>
                          <select
                            name="country"
                            id="country"
                            onChange={handlechange}
                            className="w-100 border p-2 rounded form-control"
                          >
                            <option>Select...</option>
                            {updatedata &&
                              updatedata.length > 0 &&
                              updatedata.map((item, index) => {
                                return (
                                  <>
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  </>
                                );
                              })}
                          </select>
                          <p className="text-danger">{error.country}</p>
                        </div>
                        <div className="mb-3 col-6 position-relative">
                          <label className="mb-1">Select Country Data</label>

                          {/* Dropdown button */}
                          <div
                            className="form-control d-flex justify-content-between align-items-center"
                            onClick={toggleDropdown}
                            style={{ cursor: "pointer" }}
                          >
                            <span>
                              {selectedCountries.length > 0
                                ? `${selectedCountries.length} selected`
                                : "Select countries"}
                            </span>
                            <span>▾</span>
                          </div>
                          <p className="text-danger">{error.access_country}</p>

                          {/* Dropdown menu */}
                          {open && (
                            <div
                              className="border rounded mt-1 p-2 bg-white position-absolute w-100"
                              style={{ zIndex: 1000 }}
                            >
                              {countries.map((country) => (
                                <div key={country.id} className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={country.id}
                                    checked={selectedCountries.includes(
                                      country.id,
                                    )}
                                    onChange={handleCheckboxChange}
                                  />
                                  <label className="form-check-label">
                                    {country.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 d-flex">
                        <div className="mb-3 col-md-4">
                          <label>Phone Code</label>
                          <select
                            name="country_code"
                            id="country"
                            onChange={handlechange}
                            className="w-100 border p-2 rounded form-control"
                          >
                            <option>Select...</option>
                            {updatedata &&
                              updatedata.length > 0 &&
                              updatedata.map((item, index) => {
                                return (
                                  <>
                                    <option
                                      key={item.id}
                                      value={item.phonecode}
                                    >
                                      +{item.phonecode} {item.shortname}
                                    </option>
                                  </>
                                );
                              })}
                          </select>
                          <p className="text-danger">{error.country_code}</p>
                        </div>
                        <div className="mb-3 col-md-8">
                          <label>Phone Number</label>
                          <input
                            name="phone_no"
                            id="country"
                            onChange={handlechange}
                            className="w-100 border p-2 rounded form-control"
                          />
                          <p className="text-danger">{error.phone_no}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-6">
                          <label
                            htmlFor="inputText"
                            className="form-label mb-2 md_staff"
                          >
                            Assign Roles
                          </label>
                          <FormControl style={{ width: "100%" }}>
                            <Select
                              id="demo-multiple-checkbox"
                              multiple
                              value={selectedRoles}
                              onChange={handleRoleChange}
                              input={<OutlinedInput />}
                              renderValue={(selected) =>
                                selected
                                  .map(
                                    (role) =>
                                      roleOptions.find(
                                        (option) => option.value === role,
                                      )?.label,
                                  )
                                  .join(", ")
                              }
                              MenuProps={MenuProps}
                              className="country_sel"
                              placeholder="Assign Roles"
                            >
                              <MenuItem value="all">
                                <Checkbox
                                  checked={isAllSelected}
                                  indeterminate={
                                    selectedRoles.length > 0 &&
                                    selectedRoles.length < roleOptions.length
                                  }
                                />
                                <ListItemText primary="Select All" />
                              </MenuItem>
                              {roleOptions.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <Checkbox
                                    checked={selectedRoles.includes(
                                      option.value,
                                    )}
                                  />
                                  <ListItemText primary={option.label} />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                        <div className="col-6">
                          <label
                            htmlFor="inputPassword"
                            className="form-label mb-2 md_staff"
                          >
                            New Password
                          </label>
                          <div className="col-sm-12">
                            <input
                              type="password"
                              className="form-control"
                              name="new_password"
                              onChange={handlechange}
                              id="inputPassword"
                              placeholder="password"
                            />
                            <p className="text-danger mb-0">
                              {error.new_password}
                            </p>
                          </div>
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
                        Add Member
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {loader ? (
                <div className="loader-container">
                  <div className="loader"></div>
                  <p className="loader-text">
                    Updating... This may take some time
                  </p>
                </div>
              ) : (
                <div className="table-responsive mt-3">
                  <table className="table table-striped tableICon">
                    <thead>
                      <tr>
                        <th scope="col">Sr.No.</th>
                        <th scope="col">Full Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Country</th>
                        <th scope="col">Status</th>
                        <th scope="col">View</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody style={{ border: "none" }}>
                      {data &&
                        data.length > 0 &&
                        data.map((item, index) => {
                          return (
                            <tr className="border-bottom" key={index}>
                              <th>{startIndex + index + 1}</th>
                              <td>{item.full_name}</td>
                              <td>{item.email}</td>
                              <td>{item?.country_name}</td>
                              <td>
                                {item.status === 1 ? (
                                  <label
                                    className={`switch round ${isChecked ? "checked" : ""
                                      }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={!isChecked}
                                      onClick={() => {
                                        handlelcicckac(item.id);
                                      }}
                                      onChange={() => {
                                        handleToggle(item.id);
                                      }}
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                ) : (
                                  <label
                                    className={`switch round ${isChecked ? "checked" : ""
                                      }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onClick={() => {
                                        handlelcicckac(item.id);
                                      }}
                                      onChange={() => {
                                        handleToggle(item.id);
                                      }}
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                )}
                              </td>
                              <td>
                                <fa
                                  className="fa fa-eye"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    handleclicknavigate(item);
                                  }}
                                ></fa>
                              </td>
                              <td>
                                <div className="action_btn1 d-flex align-items-center">
                                  {/* <CgPerformance    style={{
                                        color: "rgb(27 34 69)",
                                        marginRight: "10px",
                                        width: "20px",
                                        height: "15px",
                                        cursor: "pointer",
                                      }}   onClick={()=>{handleclickKPI(item)}}    /> */}
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
                                  <div className="action_btn1 me-2">
                                    <AiFillMessage
                                      style={{ cursor: "pointer" }}
                                      className="text-success"
                                      onClick={() => {
                                        querryinQuote(item);
                                      }}
                                    />
                                  </div>
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
                      {" "}
                      <i className="fi fi-rr-angle-small-left page_icon"></i>
                    </button>
                    <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                    <button
                      disabled={currentPage === totalPages}
                      className="bg_page"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <i className="fi fi-rr-angle-small-right page_icon"></i>
                    </button>
                  </div>
                </div>
              )}
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
                }}
              >
                <div className="modal-header">
                  <h2 id="modal-modal-title">Edit Staff</h2>
                  <button className="btn btn-close" onClick={closeModal2}>
                    <CloseIcon />
                  </button>
                </div>
                <div className="newModalGap">
                  <div className="row">
                    <div className="col-6">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="ware_label"
                      >
                        Email address
                      </label>
                      <input
                        type="email"
                        className="form-control mb-3"
                        value={inputdata?.staff_email}
                        id="exampleFormControlInput1"
                        placeholder="name@example.com"
                        onChange={handleupdateapi}
                        name="staff_email"
                      />
                    </div>

                    <div className="col-6">
                      <label htmlFor="inputText" className="ware_label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        onChange={handleupdateapi}
                        name="staff_name"
                        value={inputdata?.staff_name}
                        className="form-control mb-3"
                        id="inputText"
                        placeholder="Enter your Name"
                      />
                    </div>
                  </div>

                  {/* <div className="mb-3">
                      <label
                        htmlFor="country"
                        className="form-label mb-2 md_staff"
                      >
                        Country
                      </label>
                      <div className="col-sm-12">
                        <select
                          name="country"
                          id="country"
                          value={inputdata?.country}
                          className="form-control"
                          onChange={handleupdateapi}
                        >
                          <option value="">Select Country</option>
                          <option value="246">Zimbabwe</option>
                          <option value="245">Zambia</option>
                          <option value="202">South Africa</option>
                        </select>
                        <p className="text-danger">{error.country}</p>
                      </div>
                    </div> */}
                  <div className="d-flex col-12">
                    <div className="mb-3 col-md-4">
                      <label>Country Code</label>
                      <input
                        name="country_code"
                        id="country"
                        value={inputdata?.country_code}
                        className="form-control"
                        onChange={handleupdateapi}
                      />
                    </div>
                    <div className="col-8">
                      <div className="col-12">
                        <label htmlFor="inputText" className="ware_label">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          onChange={handleupdateapi}
                          name="phone_no"
                          value={inputdata?.phone_no}
                          className="form-control mb-3"
                          id="inputText"
                          placeholder="98745658"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label>Country</label>
                      <select
                        name="country"
                        id="country"
                        value={inputdata?.country}
                        className="form-control"
                        onChange={handleupdateapi}
                      >
                        <option>Select...</option>
                        {updatedata &&
                          updatedata.length > 0 &&
                          updatedata.map((item, index) => {
                            return (
                              <>
                                <option key={item.id} value={item.id}>{item.name}</option>
                              </>
                            );
                          })}
                      </select>
                    </div>
                    <div className="col-6">
                      <label htmlFor="multipleSelect" className="ware_label">
                        Assign Roles
                      </label>
                      <br />
                      <FormControl className="w-100">
                        <Select
                          multiple
                          value={selectedRoles}
                          onChange={handleRoleChange}
                          input={<OutlinedInput />} // Removed label from OutlinedInput
                          renderValue={(selected) =>
                            selected
                              .map(
                                (role) =>
                                  roleOptions.find(
                                    (option) => option.value === role,
                                  )?.label,
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
                  <div className="row">
                    <div className="col-6">
                      <label htmlFor="inputPassword" className="ware_label">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="form-control mb-3"
                        name="new_password"
                        onChange={handleupdateapi}
                        id="inputPassword"
                        placeholder="password"
                      />
                      <p className="text-danger mb-0">{error.new_password}</p>
                    </div>
                    <div className="mb-3 col-6 position-relative">
                      <label className="mb-1">Select Country Data</label>

                      {/* Dropdown button */}
                      <div
                        className="form-control d-flex justify-content-between align-items-center"
                        onClick={toggleDropdown}
                        style={{ cursor: "pointer" }}
                      >
                        <span>
                          {selectedCountries.length > 0
                            ? `${selectedCountries.length} selected`
                            : "Select countries"}
                        </span>
                        <span>▾</span>
                      </div>

                      {/* Dropdown menu */}
                      {open && (
                        <div
                          className="border rounded mt-1 p-2 bg-white position-absolute w-100"
                          style={{ zIndex: 1000 }}
                        >
                          {countries.map((country) => (
                            <div key={country.id} className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                value={country.id}
                                checked={selectedCountries.includes(
                                  country.id,
                                )}
                                onChange={handleCheckboxChange}
                              />
                              <label className="form-check-label">
                                {country.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center mt-2 unsetLt">
                    <Button
                      variant="contained"
                      className="submit_btn"
                      onClick={postData1234}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </Box>
            </Modal>
          </div>
        </div>
      </div>
      
    </>
  );
}
