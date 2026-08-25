import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
const pageSize = 10;
const SERVICE_TYPES = [
  { value: "all", label: "All" },
  { value: "shipping", label: "Shipping" },
  { value: "airfreight", label: "Airfreight" },
  { value: "seafreight", label: "Seafreight" },
  { value: "roadfreight", label: "Roadfreight" },
  { value: "courier", label: "Courier" },
  { value: "customs_clearing", label: "Customs Clearing" },
  { value: "warehousing", label: "Warehousing" },
  { value: "consulting", label: "Consulting" },
  { value: "handling_unpacking", label: "Handling & Unpacking" },
];
const emptySupplierForm = {
  supplier_email: "",
  supplier_name: "",
  supplier_phone: "",
  supplier_country: "",
  country_code: "",
  password: "",
  user_type: "",
  company_name: "",
  address: "",
  country_based: "",
  service_type: "",
};

const Field = ({ label, children, col = "col-12 col-md-6" }) => (
  <div className={`supplier-field ${col}`}>
    <label className="supplier-field-label">{label}</label>
    {children}
  </div>
);

export default function ManageSupplier() {
  const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
  const userid = userdata?.id;
  const usertype = userdata?.user_type;
  const [hasPermission, setHasPermission] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [countruies, setCountruies] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [pagenationData, setPagenationData] = useState(1);
  const [input, setInput] = useState({ ...emptySupplierForm });
  const [inputdata, setInputdata] = useState({
    ...emptySupplierForm,
    supplier_id: "",
    profile: null,
  });
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
        route_url: "/Admin/manage-suppliers",
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        checkPost
      );
      if (response.data && response.data.success === true) {
        setHasPermission(true);
        getdata(currentPage, searchQuery);
      } else {
        setHasPermission(false);
        toast.error("Permission Denied: You don't have access to this page");
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      setHasPermission(false);
      toast.error(error.response?.data?.message || "Permission Denied: You don't have access to this page");
    } finally {
      setLoader(false);
    }
  };

  // ---------------- FETCH DATA ----------------
  const getdata = async (page = 1, search = "") => {
    try {
      setLoader(true);

      const payload = {
        page: page,
        limit: pageSize,
        search: search,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}new-supplier-list`,
        payload
      );

      setData(response.data.data);
      setPagenationData(response.data);
    } catch (error) {
      toast.error("Error fetching suppliers");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  // ---------------- SEARCH + PAGINATION ----------------
  const filterdata = data?.filter((item) => {
    return (
      item?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
  });

  const totalPages = Math.ceil(pagenationData.total / pagenationData.limit);

  // ---------------- HANDLE INPUT (ADD) ----------------
  const handlechange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- ADD SUPPLIER ----------------
  const openAddModal = () => {
    setInput({ ...emptySupplierForm });
    setIsModalOpen(true);
  };

  const closeAddModal = () => {
    setIsModalOpen(false);
    setInput({ ...emptySupplierForm });
  };
  const closeEditModal = () => {
    setIsModalOpen2(false);
  };
  const handleAddSupplier = () => {
    const data = {
      supplier_email: input.supplier_email,
      supplier_name: input.supplier_name,
      phone_no: input.supplier_phone,
      country: input.supplier_country,
      password: input.password,
      user_type: input.user_type,
      country_code: input.country_code,
      company_name: input.company_name,
      address: input.address,
      country_based: input.country_based,
      service_type: input.service_type,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}add-supplier`, data)
      .then((res) => {
        toast.success(res.data.message || "Supplier added successfully!");
        closeAddModal();
        getdata();
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data?.message || "Invalid input!");
        } else if (error.request) {
          toast.error("Network error! Server not responding.");
        } else {
          toast.error("Unexpected error: " + error.message);
        }
      });
  };

  // ---------------- DELETE SUPPLIER ----------------
  const handledelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(`${process.env.REACT_APP_BASE_URL}delete-supplier`, {
            supplier_id: id,
          })
          .then((res) => {
            toast.success(res.data.message);
            getdata();
          })
          .catch((err) => {
            toast.error(err.response?.data?.message || "Delete failed!");
          });
      }
    });
  };

  // ---------------- OPEN EDIT MODAL ----------------
  const openModal2 = (id) => {
    const usr = data.find((p) => p.id === id);

    if (usr) {
      setInputdata({
        supplier_id: usr.id,
        supplier_email: usr.email || "",
        supplier_name: usr.name || "",
        supplier_phone: usr.phone_no || "",
        supplier_country:
          usr.country != null ? String(usr.country) : "",
        country_code: resolveCountryCode(usr.country_code),
        password: "",
        profile: null,
        user_type: usr.user_type || "",
        company_name: usr.company_name || "",
        address: usr.address || "",
        country_based:
          usr.country_based != null ? String(usr.country_based) : "",
        service_type: usr.service_type || "",
      });
    }
    setIsModalOpen2(true);
  };

  // ---------------- HANDLE UPDATE INPUT ----------------
  const handleupdateapi = (e) => {
    const { name, value, files } = e.target;

    if (name === "profile") {
      setInputdata((prev) => ({ ...prev, profile: files[0] }));
    } else {
      setInputdata((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ---------------- UPDATE SUPPLIER ----------------
  const postData1234 = () => {
    const formdata = new FormData();
    formdata.append("supplier_id", inputdata.supplier_id);
    formdata.append("supplier_email", inputdata.supplier_email);
    formdata.append("supplier_name", inputdata.supplier_name);
    formdata.append("phone_no", inputdata.supplier_phone);
    formdata.append("country", inputdata.supplier_country);
    formdata.append("country_code", inputdata.country_code);
    formdata.append("company_name", inputdata.company_name);
    formdata.append("address", inputdata.address);
    formdata.append("country_based", inputdata.country_based);
    formdata.append("service_type", inputdata.service_type);

    if (inputdata.password) {
      formdata.append("password", inputdata.password);
    }

    if (inputdata.profile) {
      formdata.append("profile", inputdata.profile);
    }

    axios
      .post(`${process.env.REACT_APP_BASE_URL}update-supplier`, formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        toast.success(res.data.message);
        closeEditModal();
        getdata();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Update failed!");
      });
  };

  // ---------------- GET COUNTRIES ----------------
  const getcountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        setCountruies(response.data.data);
      })
      .catch(() => {
        toast.error("Country fetch failed");
      });
  };

  useEffect(() => {
    getcountry();
  }, []);
  const handleSearch = (e) => {
    const value = e.target.value;

    setSearchQuery(value);
    setCurrentPage(1);

    getdata(1, value);
  };

  const resolveCountryCode = (code) => {
    if (code === "" || code == null) return "";
    const matchByPhone = countruies.find(
      (c) => String(c.phonecode) === String(code)
    );
    if (matchByPhone) return String(matchByPhone.phonecode);
    const matchById = countruies.find((c) => String(c.id) === String(code));
    return matchById ? String(matchById.phonecode) : String(code);
  };

  const getCountryNameById = (id) => {
    if (!id) return "-";
    const country = countruies.find((c) => String(c.id) === String(id));
    return country?.name || id;
  };

  // const handleCountryChange = (e) => {
  //   const countryId = e.target.value;

  //   const selectedCountry = countruies.find((c) => c.id === Number(countryId));

  //   setInput((prev) => ({
  //     ...prev,
  //     supplier_country: countryId,
  //     supplier_phone: selectedCountry ? `+${selectedCountry.phonecode} ` : "",
  //   }));
  // };

  const getServiceLabel = (value) =>
    SERVICE_TYPES.find((s) => s.value === value)?.label || value || "-";

  const renderSupplierFields = (values, onChange, isEdit = false) => (
    <div className="supplier-form-fields">
      <div className="supplier-form-section">
        <p className="supplier-form-section-title">Company Details</p>
        <div className="row supplier-form-row">
          <Field label="Company Name">
            <input
              type="text"
              className="form-control"
              name="company_name"
              placeholder="Company name"
              value={values.company_name || ""}
              onChange={onChange}
            />
          </Field>
          <Field label="Type of Service">
            <select
              name="service_type"
              className="form-control"
              value={values.service_type || ""}
              onChange={onChange}
            >
              <option value="">Select service type</option>
              {SERVICE_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Address" col="col-12">
            <input
              type="text"
              className="form-control"
              name="address"
              placeholder="Full address"
              value={values.address || ""}
              onChange={onChange}
            />
          </Field>
          <Field label="Country Based">
            <select
              name="country_based"
              className="form-control"
              value={values.country_based || ""}
              onChange={onChange}
            >
              <option value="">Select country</option>
              {countruies?.map((item) => (
                <option key={`based-${item.id}`} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Country of Origin">
            <select
              name="supplier_country"
              className="form-control"
              value={values.supplier_country || ""}
              onChange={onChange}
            >
              <option value="">Select</option>
              {countruies?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="supplier-form-section">
        <p className="supplier-form-section-title">Account Details</p>
        <div className="row supplier-form-row">
          <Field label="Email">
            <input
              type="email"
              className="form-control"
              name="supplier_email"
              placeholder="test@example.com"
              value={values.supplier_email || ""}
              onChange={onChange}
            />
          </Field>
          <Field label="Full Name">
            <input
              type="text"
              className="form-control"
              name="supplier_name"
              placeholder="Supplier name"
              value={values.supplier_name || ""}
              onChange={onChange}
            />
          </Field>
          <Field label="Country Code" col="col-12 col-sm-4">
            <select
              name="country_code"
              className="form-control"
              value={values.country_code || ""}
              onChange={onChange}
            >
              <option value="">Select</option>
              {countruies?.map((item) => (
                <option key={`code-${item.id}`} value={item.phonecode}>
                  +{item.phonecode} {item.shortname}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phone Number" col="col-12 col-sm-8">
            <input
              type="text"
              className="form-control"
              name="supplier_phone"
              placeholder="Phone number"
              value={values.supplier_phone || ""}
              onChange={onChange}
            />
          </Field>
          {!isEdit && (
            <>
              <Field label="Register as">
                <select
                  name="user_type"
                  className="form-control"
                  value={values.user_type || ""}
                  onChange={onChange}
                >
                  <option value="">Select...</option>
                  <option value="1">Supplier</option>
                  <option value="2">Warehouse</option>
                </select>
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={values.password || ""}
                  onChange={onChange}
                />
              </Field>
            </>
          )}
          {isEdit && (
            <>
              <Field label="Profile Image">
                <input
                  type="file"
                  className="form-control"
                  name="profile"
                  onChange={onChange}
                />
              </Field>
              <Field label="Password (optional)">
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={values.password || ""}
                  onChange={onChange}
                  placeholder="Leave blank to keep current"
                />
              </Field>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {loader || hasPermission === null ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Loading...</p>
        </div>
      ) : hasPermission === false ? (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="row manageFreight">
              <div className="col-12">
                <h4 className="freight_hd">Manage Supplier</h4>
                <div className="line"></div>
              </div>
            </div>
            <div className="text-center mt-5">
              <h3 className="text-danger">You don't have permission to access this page</h3>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="wpWrapper">
          <div className="container-fluid">
            <div className="d-flex justify-content-between my-3">
              <h4>Manage Supplier</h4>

              <div className="d-flex gap-2 searchManageFre">
                <input
                  type="text"
                  placeholder="Search"
                  className=" "
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <button
                  className="blueBtn"
                  onClick={openAddModal}
                >
                  Add Supplier
                </button>
              </div>
            </div>
            {/* ---------------- TABLE ---------------- */}
            {loader ? (
              <div className="loader-container">
                <div className="loader"></div>
                <p>Loading...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Sr.No.</th>
                      {/* <th>Company</th> */}
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      {/* <th>Service Type</th> */}
                      <th>Country</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        {/* <td>{item.company_name || "-"}</td> */}
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.phone_no}</td>
                        {/* <td>{getServiceLabel(item.service_type)}</td>
                        <td>
                          {item.country_based_name ||
                            getCountryNameById(item.country_based)}
                        </td> */}
                        <td>{item.country_name}</td>
                        <td>
                          <FaEdit
                            onClick={() => openModal2(item.id)}
                            style={{
                              color: "#1b2245",
                              marginRight: "10px",
                              cursor: "pointer",
                            }}
                          />
                          <AiFillDelete
                            className="text-danger"
                            style={{ cursor: "pointer" }}
                            onClick={() => handledelete(item.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* PAGINATION */}
                <div className="d-flex justify-content-end align-items-end">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                      getdata(currentPage - 1, searchQuery);
                    }}
                    className="bg_page"
                  >
                    <i class="fi fi-rr-angle-small-left page_icon"></i>
                  </button>

                  <span className="mx-2">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    className="bg_page"
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      getdata(currentPage + 1, searchQuery);
                    }}
                  >
                    <i class="fi fi-rr-angle-small-right page_icon"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ---------------- ADD SUPPLIER MODAL ---------------- */}
        {isModalOpen && (
          <div className="custom-modal supplier-modal-overlay">
            <div className="custom-modal-content supplier-modal-content">
              <div className="custom-modal-header">
                <h5>Add Supplier</h5>
                <button className="btn-close" onClick={closeAddModal}>
                  <CloseIcon />
                </button>
              </div>
              <div className="custom-modal-body">
                {renderSupplierFields(input, handlechange, false)}
              </div>
              <div className="custom-modal-footer supplier-modal-footer">
                <button
                  type="button"
                  className="btn btn-primary supplier-modal-submit"
                  onClick={handleAddSupplier}
                >
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
        )}

        {isModalOpen2 && (
          <div className="custom-modal supplier-modal-overlay">
            <div className="custom-modal-content supplier-modal-content">
              <div className="custom-modal-header">
                <h5>Edit Supplier</h5>
                <button className="btn-close" onClick={closeEditModal}>
                  <CloseIcon />
                </button>
              </div>
              <div className="custom-modal-body">
                {renderSupplierFields(inputdata, handleupdateapi, true)}
              </div>
              <div className="custom-modal-footer supplier-modal-footer">
                <button
                  type="button"
                  className="btn btn-primary supplier-modal-submit"
                  onClick={postData1234}
                >
                  Update Supplier
                </button>
              </div>
            </div>
          </div>
        )}
        
        </>
      )}
    </>
  );
}
