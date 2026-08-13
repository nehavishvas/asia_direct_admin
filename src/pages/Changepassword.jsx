// import axios from "axios";
// import { useState } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css"; // Ensure you import the CSS for toastify
// export default function Changepassword() {
//     const currentuser = JSON?.parse(localStorage?.getItem("data123"));
//     const [data, setData] = useState({
//         oldpassword: "",
//         newpassword: "",
//         confirmpassword: "",
//         id: currentuser?.id
//     });
//     const [errors, setErrors] = useState({});
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setData({ ...data, [name]: value });
//         setErrors({ ...errors, [name]: "" });
//     };
//     const handleValidate = () => {
//         let newErrors = {};
//         let isValid = true;
//         if (!data.oldpassword) {
//             newErrors.oldpassword = "Old password is required";
//             isValid = false;
//         }
//         if (!data.newpassword) {
//             newErrors.newpassword = "New password is required";
//             isValid = false;
//         }
//         if (!data.confirmpassword) {
//             newErrors.confirmpassword = "Confirm password is required";
//             isValid = false;
//         }
//         if (data.newpassword !== data.confirmpassword) {
//             newErrors.passwordMatch = "Passwords do not match";
//             isValid = false;
//         }
//         setErrors(newErrors);
//         if (!isValid) {
//             if (newErrors.oldpassword) {
//                 toast.error(newErrors.oldpassword);
//             } else if (newErrors.newpassword) {
//                 toast.error(newErrors.newpassword);
//             } else if (newErrors.confirmpassword) {
//                 toast.error(newErrors.confirmpassword);
//             } else if (newErrors.passwordMatch) {
//                 toast.error(newErrors.passwordMatch);
//             }
//         }
//         return isValid;
//     };
//     const handleClick = () => {
//         if (handleValidate()) {
//             apiHit();
//         }
//     };
//     const apiHit = () => {
//         axios.post(`${process.env.REACT_APP_BASE_URL}change-password`, data).then((response) => {
//             if (response.status === 200) {
//                 toast.success(response.data.message);
//                 setData({
//                     id: currentuser?.id,
//                     oldpassword: "",
//                     newpassword: "",
//                     confirmpassword: "",
//                 });
//             } else {
//                 toast.error(response.data.message);
//             }
//         }).catch((error) => {
//             toast.error(error.response?.data?.message || "An error occurred");
//         });
//     };
//     return (
//         <>
//             <div className="wpWrapper">
//                 <div className="container-fluid">
//                     <div className="card">
//                         <div className="card-body">
//                             <div className="row">
//                                 <div className="col-12">
//                                     <h4 className="freight_hd">Change Password</h4>
                                    
//                                 </div>
//                             </div>
//                             <div className="row mt-2 py-2">
//                                 <div className="col-lg-6">
//                                     <div className="form-floating mb-3">
//                                         <input
//                                             type="password"
//                                             onChange={handleChange}
//                                             name="oldpassword"
//                                             className={`form-control px-3 ${errors.oldpassword ? "is-invalid" : ""}`}
//                                             id="floatingInput"
//                                             placeholder="Old Password"
//                                             value={data.oldpassword}
//                                         />
//                                         <label htmlFor="floatingInput" className="px-3">Old Password</label>
//                                         {errors.oldpassword && (
//                                             <div className="invalid-feedback">{errors.oldpassword}</div>
//                                         )}
//                                     </div>
//                                     <div className="form-floating mb-3">
//                                         <input
//                                             type="password"
//                                             onChange={handleChange}
//                                             name="newpassword"
//                                             className={`form-control px-3 ${errors.newpassword ? "is-invalid" : ""}`}
//                                             id="floatingPassword"
//                                             placeholder="New Password"
//                                             value={data.newpassword}
//                                         />
//                                         <label htmlFor="floatingPassword" className="px-3">New Password</label>
//                                         {errors.newpassword && (
//                                             <div className="invalid-feedback">{errors.newpassword}</div>
//                                         )}
//                                     </div>
//                                     <div className="form-floating mb-3">
//                                         <input
//                                             type="password"
//                                             onChange={handleChange}
//                                             name="confirmpassword"
//                                             className={`form-control px-3 ${errors.confirmpassword ? "is-invalid" : ""}`}
//                                             id="floatingPassword1"
//                                             placeholder="Confirm Password"
//                                             value={data.confirmpassword}
//                                         />
//                                         <label htmlFor="floatingPassword1" className="px-3">Confirm Password</label>
//                                         {errors.confirmpassword && (
//                                             <div className="invalid-feedback">{errors.confirmpassword}</div>
//                                         )}
//                                         {errors.passwordMatch && (
//                                             <div className="invalid-feedback">{errors.passwordMatch}</div>
//                                         )}
//                                     </div>
//                                     <button
//                                         className="btn text-white mt-2"
//                                         style={{ backgroundColor: "#1b2245" }}
//                                         onClick={handleClick}
//                                     >
//                                         Change Password
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 
//             </div>
//         </>
//     );
// }
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure you import the CSS for toastify
export default function Changepassword() {
  const currentuser = JSON?.parse(localStorage?.getItem("data123"));
  const [data, setData] = useState({
    oldpassword: "",
    newpassword: "",
    confirmpassword: "",
    id: currentuser?.id,
  });
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };
  const handleValidate = () => {
    let newErrors = {};
    let isValid = true;
    if (!data.oldpassword) {
      newErrors.oldpassword = "Old password is required";
      isValid = false;
    }
    if (!data.newpassword) {
      newErrors.newpassword = "New password is required";
      isValid = false;
    }
    if (!data.confirmpassword) {
      newErrors.confirmpassword = "Confirm password is required";
      isValid = false;
    }
    if (data.newpassword !== data.confirmpassword) {
      newErrors.passwordMatch = "Passwords do not match";
      isValid = false;
    }
    setErrors(newErrors);
    if (!isValid) {
      if (newErrors.oldpassword) {
        toast.error(newErrors.oldpassword);
      } else if (newErrors.newpassword) {
        toast.error(newErrors.newpassword);
      } else if (newErrors.confirmpassword) {
        toast.error(newErrors.confirmpassword);
      } else if (newErrors.passwordMatch) {
        toast.error(newErrors.passwordMatch);
      }
    }
    return isValid;
  };
  const handleClick = () => {
    if (handleValidate()) {
      apiHit();
    }
  };
  const apiHit = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}change-password`, data)
      .then((response) => {
        if (response.status === 200) {
          toast.success(response.data.message);
          setData({
            id: currentuser?.id,
            oldpassword: "",
            newpassword: "",
            confirmpassword: "",
          });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      });
  };
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-8">
              <div className="card border-0 shadow-md rounded-4 mt-2">
                <div className="card-header bg-transparent border-0 pt-4 pb-0 px-4">
                  <h4 className="fw-bold mb-1" style={{ color: "#1b2245" }}>Change Password</h4>
                  <p className="text-muted small">Update your account password securely below.</p>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-secondary small mb-1">Old Password</label>
                    <input
                      type="password"
                      onChange={handleChange}
                      name="oldpassword"
                      className={`form-control form-control-lg rounded-3 fs-6 ${errors.oldpassword ? "is-invalid" : ""}`}
                      placeholder="Enter your old password"
                      value={data.oldpassword}
                    />
                    {errors.oldpassword && <div className="invalid-feedback">{errors.oldpassword}</div>}
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-secondary small mb-1">New Password</label>
                    <input
                      type="password"
                      onChange={handleChange}
                      name="newpassword"
                      className={`form-control form-control-lg rounded-3 fs-6 ${errors.newpassword ? "is-invalid" : ""}`}
                      placeholder="Create a new password"
                      value={data.newpassword}
                    />
                    {errors.newpassword && <div className="invalid-feedback">{errors.newpassword}</div>}
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-secondary small mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      onChange={handleChange}
                      name="confirmpassword"
                      className={`form-control form-control-lg rounded-3 fs-6 ${errors.confirmpassword ? "is-invalid" : ""}`}
                      placeholder="Confirm your new password"
                      value={data.confirmpassword}
                    />
                    {errors.confirmpassword && <div className="invalid-feedback">{errors.confirmpassword}</div>}
                    {errors.passwordMatch && <div className="invalid-feedback">{errors.passwordMatch}</div>}
                  </div>
                  
                  <button
                    className="btn w-100 py-2 rounded-3 text-white fw-bold shadow-sm"
                    style={{ background: "linear-gradient(135deg, #0b4170 0%, #1b2245 100%)", transition: "all 0.2s" }}
                    onClick={handleClick}
                  >
                    Update Password
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
