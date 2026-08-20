import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MyContext1 } from "../../Context/MyContext";
import CloseIcon from "@mui/icons-material/Close";
export default function Profile() {
  const [data, setData] = useState({});
  const { text, setText } = useContext(MyContext1);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchData();
  }, []);
  const datauserId = JSON.parse(localStorage.getItem("data123"));
  const fetchData = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}get-profile-admin`,
        {
          user_id: datauserId.id,
        }
      );
      setData(response.data.data);
    } catch (error) {
      console.error(error.response?.data);
      toast.error("Failed to fetch profile data");
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };
  const handlePostData = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("profile", profileImage);
      formData.append("full_name", data.full_name);
      formData.append("email", data.email);
      formData.append("id", datauserId.id);
      await axios
        .post(`${process.env.REACT_APP_BASE_URL}update-profile`, formData)
        .then((response) => {
          setText(response.data.data[0].profile)
        })
      toast.success("Profile updated successfully")
      fetchData()
    } catch (error) {
      console.error(error.response?.data)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }
  const handleChangeFile = (e) => {
    const file = e.target.files[0]
    setProfileImage(file)
  }
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          
          <div className="row mt-4 justify-content-center">
            <div className="col-lg-4 col-md-5 mb-4">
              <div className="card border-0 shadow-md rounded-4 h-100 text-center py-5">
                <div className="position-relative d-inline-block mx-auto mb-3">
                  <img
                    src={text && text !== "null" ? `${process.env.REACT_APP_BASE_URL_image}${text}` : (data?.profile && data.profile !== "null" && data.profile !== "undefined" ? `${process.env.REACT_APP_BASE_URL_image}${data.profile}` : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>")}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
                    }}
                    style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', backgroundColor: '#f1f5f9' }}
                    className="rounded-circle"
                    alt="Profile"
                  />
                </div>
                <h5 className="fw-bold mb-1" style={{ color: '#1b2245' }}>{data?.full_name}</h5>
                <p className="text-muted mb-4">{data?.Role || 'Administrator'}</p>
                <button
                  type="button"
                  className="btn mx-4 py-2 rounded-pill text-white fw-medium shadow-md"
                  style={{ background: "linear-gradient(135deg, #0b4170 0%, #1b2245 100%)" }}
                  data-bs-toggle="modal"
                  data-bs-target="#staticBackdrop"
                >
                  Update Profile
                </button>
              </div>
            </div>
            
            <div className="col-lg-8 col-md-7 mb-4">
              <div className="card border-0 shadow-md rounded-4 h-100 p-4">
                <h5 className="fw-bold mb-4" style={{ color: '#1b2245', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>Basic Information</h5>
                
                <div className="row mb-4">
                  <div className="col-sm-4 text-muted fw-semibold">Full Name</div>
                  <div className="col-sm-8 fw-medium">{data?.full_name}</div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-sm-4 text-muted fw-semibold">Email Address</div>
                  <div className="col-sm-8 fw-medium">{data?.email}</div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-sm-4 text-muted fw-semibold">Role</div>
                  <div className="col-sm-8 fw-medium">
                    <span className="badge rounded-pill px-3 py-2 text-white" style={{ background: "linear-gradient(135deg, #0b4170 0%, #1b2245 100%)" }}>
                       {data?.Role || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal fade"
            id="staticBackdrop"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex={-1}
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header border-0 pb-0" style={{ background: '#f8f9fa' }}>
                  <h5 className="modal-title fw-bold" id="staticBackdropLabel" style={{ color: '#1b2245' }}>
                    Update Profile
                  </h5>
                  <button
                    type="button"
                    className="btn border-0 text-muted p-0 m-0 d-flex align-items-center justify-content-center"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                     <CloseIcon />
                  </button>
                </div>
                <div className="modal-body p-4" style={{ background: '#f8f9fa' }}>
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                        <img
                          src={data?.profile && data.profile !== "null" && data.profile !== "undefined" ? `${process.env.REACT_APP_BASE_URL_image}${data.profile}` : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>"}
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
                          }}
                          style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%", border: "3px solid white", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", backgroundColor: '#f1f5f9' }}
                          alt="Profile"
                        />
                       <div className="mt-3">
                         <input
                           type="file"
                           name="profile"
                           onChange={handleChangeFile}
                           className="form-control form-control-sm rounded-pill"
                         />
                       </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Full Name</label>
                    <input
                      value={data?.full_name || ""}
                      name="full_name"
                      onChange={handleChange}
                      className="form-control form-control-lg rounded-3 fs-6"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold small text-muted">Email Address</label>
                    <input
                      value={data?.email || ""}
                      name="email"
                      onChange={handleChange}
                      className="form-control form-control-lg rounded-3 fs-6"
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0" style={{ background: '#f8f9fa' }}>
                  <button type="button" className="btn btn-light rounded-pill px-4 fw-medium shadow-sm" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="button" className="btn text-white rounded-pill px-4 fw-medium shadow-sm" style={{ background: "linear-gradient(135deg, #0b4170 0%, #1b2245 100%)" }} onClick={handlePostData} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
