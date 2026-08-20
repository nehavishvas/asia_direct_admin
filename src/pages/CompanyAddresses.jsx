import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaEye } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";

const pageSize = 10;

const emptyAddressForm = {
  id: "",
  company_name: "",
  address_line: "",
  city: "",
  state_region: "",
  country: "",
  postal_code: "",
  email: "",
  telephone: "",
  company_registration_no: "",
  tax_vat_no: "",
};

const Field = ({ label, children, col = "col-12 col-md-6" }) => (
  <div className={`supplier-field ${col}`}>
    <label className="supplier-field-label">{label}</label>
    {children}
  </div>
);

export default function CompanyAddresses() {
  const [currentPage, setCurrentPage] = useState(1);
  const [allAddresses, setAllAddresses] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [inputdata, setInputdata] = useState({ ...emptyAddressForm });

  // ---------------- FETCH DATA ----------------
  const getdata = async () => {
    try {
      setLoader(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}company-addresses`
      );
      if (response.data && response.data.success) {
        setAllAddresses(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch company addresses");
      }
    } catch (error) {
      toast.error("Error fetching company addresses");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getdata();
  }, []);

  // ---------------- SEARCH FILTERING ----------------
  const filteredAddresses = allAddresses.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.company_name?.toLowerCase() || "").includes(query) ||
      (item.email?.toLowerCase() || "").includes(query) ||
      (item.city?.toLowerCase() || "").includes(query) ||
      (item.country?.toLowerCase() || "").includes(query)
    );
  });

  const totalPages = Math.ceil(filteredAddresses.length / pageSize) || 1;
  const pageIndex = Math.min(currentPage, totalPages);
  const displayedAddresses = filteredAddresses.slice(
    (pageIndex - 1) * pageSize,
    pageIndex * pageSize
  );

  // ---------------- OPEN EDIT MODAL ----------------
  const openEditModal = async (id, readOnly = false) => {
    try {
      setLoader(true);
      setIsReadOnly(readOnly);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}company-address/${id}`
      );
      if (response.data && response.data.success) {
        let address = response.data.data;
        if (Array.isArray(address)) {
          address = address[0];
        }
        if (address) {
          setInputdata({
            id: address.id || "",
            company_name: address.company_name || "",
            address_line: address.address_line || "",
            city: address.city || "",
            state_region: address.state_region || "",
            country: address.country || "",
            postal_code: address.postal_code || "",
            email: address.email || "",
            telephone: address.telephone || "",
            company_registration_no: address.company_registration_no || "",
            tax_vat_no: address.tax_vat_no || "",
          });
          setIsModalOpen(true);
        } else {
          toast.error("Address details not found");
        }
      } else {
        toast.error("Failed to fetch address details");
      }
    } catch (error) {
      toast.error("Error fetching address details");
    } finally {
      setLoader(false);
    }
  };

  // ---------------- HANDLE INPUT CHANGE ----------------
  const handlechange = (e) => {
    const { name, value } = e.target;
    setInputdata((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- UPDATE ADDRESS ----------------
  const handleUpdate = () => {
    const payload = {
      id: inputdata.id,
      company_name: inputdata.company_name,
      address_line: inputdata.address_line,
      city: inputdata.city,
      country: inputdata.country,
      postal_code: inputdata.postal_code,
      state_region: inputdata.state_region,
      email: inputdata.email,
      telephone: inputdata.telephone,
      company_registration_no: inputdata.company_registration_no,
      tax_vat_no: inputdata.tax_vat_no,
    };

    axios
      .post(`${process.env.REACT_APP_BASE_URL}addOrUpdate-company-address`, payload)
      .then((res) => {
        toast.success(res.data.message || "Company address updated successfully!");
        setIsModalOpen(false);
        getdata();
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data?.message || "Update failed!");
        } else {
          toast.error("Unexpected error: " + error.message);
        }
      });
  };

  const renderFields = () => (
    <div className="supplier-form-fields">
      <div className="supplier-form-section">
        <p className="supplier-form-section-title">Company Information</p>
        <div className="row supplier-form-row">
          <Field label="Company Name">
            <input
              type="text"
              className="form-control"
              name="company_name"
              placeholder="Company name"
              value={inputdata.company_name || ""}
              onChange={handlechange}
              disabled={isReadOnly}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="finance@example.com"
              value={inputdata.email || ""}
              onChange={handlechange}
              disabled={isReadOnly}
            />
          </Field>
          <Field label="Telephone">
            <input
              type="text"
              className="form-control"
              name="telephone"
              placeholder="Telephone"
              value={inputdata.telephone || ""}
              onChange={handlechange}
              disabled={isReadOnly}
            />
          </Field>
          <Field label="Company Registration No">
            <input
              type="text"
              className="form-control"
              name="company_registration_no"
              placeholder="Registration No"
              value={inputdata.company_registration_no || ""}
              onChange={handlechange}
              disabled={isReadOnly}
            />
          </Field>
          <Field label="Tax / VAT No">
            <input
              type="text"
              className="form-control"
              name="tax_vat_no"
              placeholder="Tax / VAT No"
              value={inputdata.tax_vat_no || ""}
              onChange={handlechange}
              disabled={isReadOnly}
            />
          </Field>
        </div>
      </div>

      <div className="supplier-form-section">
        <p className="supplier-form-section-title">Address Details</p>
        <div className="row supplier-form-row">
          <Field label="Address Line" col="col-12">
            <input
              type="text"
              className="form-control"
              name="address_line"
              placeholder="Address line"
              value={inputdata.address_line || ""}
              onChange={handlechange}
              disabled={isReadOnly}
            />
          </Field>
          <Field label="City">
            <input
              type="text"
              className="form-control"
              name="city"
              placeholder="City"
              value={inputdata.city || ""}
              onChange={handlechange}
              disabled={isReadOnly}
            />
          </Field>
          <Field label="State / Region">
            <input
              type="text"
              className="form-control"
              name="state_region"
              placeholder="State or region"
              value={inputdata.state_region || ""}
              onChange={handlechange}
              disabled={isReadOnly}
            />
          </Field>
          <Field label="Country">
            <input
              type="text"
              className="form-control"
              name="country"
              placeholder="Country"
              value={inputdata.country || ""}
              onChange={handlechange}
              disabled={true}
            />
          </Field>
          <Field label="Postal Code">
            <input
              type="text"
              className="form-control"
              name="postal_code"
              placeholder="Postal code"
              value={inputdata.postal_code || ""}
              onChange={handlechange}
              disabled={isReadOnly}
            />
          </Field>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="d-flex justify-content-between my-3">
            <h4>Company Addresses</h4>

            <div className="d-flex gap-2 searchManageFre">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
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
                    <th>Company Name</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th>Telephone</th>
                    <th>Registration No / Tax No</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAddresses.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{(pageIndex - 1) * pageSize + index + 1}</td>
                      <td>{item.company_name || "-"}</td>
                      <td>{item.email || "-"}</td>
                      <td>{item.country || "-"}</td>
                      <td>{item.telephone || "-"}</td>
                      <td>
                        <div><strong>Reg:</strong> {item.company_registration_no || "-"}</div>
                        <div><strong>Tax:</strong> {item.tax_vat_no || "-"}</div>
                      </td>
                      <td>
                        {[
                          item.address_line,
                          item.city,
                          item.state_region,
                          item.country,
                          item.postal_code,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </td>
                      <td>
                        <FaEye
                          onClick={() => openEditModal(item.id, true)}
                          style={{
                            color: "#1b2245",
                            marginRight: "10px",
                            cursor: "pointer",
                          }}
                        />
                        <FaEdit
                          onClick={() => openEditModal(item.id, false)}
                          style={{
                            color: "#1b2245",
                            marginRight: "10px",
                            cursor: "pointer",
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  {displayedAddresses.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No company addresses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-end align-items-end my-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                    }}
                    className="bg_page"
                  >
                    <i className="fi fi-rr-angle-small-left page_icon"></i>
                  </button>

                  <span className="mx-2">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    className="bg_page"
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                    }}
                  >
                    <i className="fi fi-rr-angle-small-right page_icon"></i>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- EDIT MODAL ---------------- */}
      {isModalOpen && (
        <div className="custom-modal supplier-modal-overlay">
          <div className="custom-modal-content supplier-modal-content">
            <div className="custom-modal-header">
              <h5>{isReadOnly ? "View Company Address" : "Edit Company Address"}</h5>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="custom-modal-body">
              {renderFields()}
            </div>
            <div className="custom-modal-footer supplier-modal-footer">
              {isReadOnly ? (
                <button
                  type="button"
                  className="btn btn-secondary supplier-modal-submit"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary supplier-modal-submit"
                  onClick={handleUpdate}
                >
                  Update Address
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
    </>
  );
}