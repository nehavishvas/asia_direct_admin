import React, { useEffect, useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
import { toast } from "react-toastify";

const PrivacyPolicy = () => {
  const [description12, setDescription12] = useState([]);
  const [heading, setHeading] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [loader, setLoader] = useState(false);
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;

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
        route_url: "/Admin/privacy-policy",
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        checkPost
      );
      if (response.data && response.data.success === true) {
        setHasPermission(true);
        getdataapi();
      } else {
        setHasPermission(false);
        toast.error("Permission Denied: You don't have access to this page");
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      setHasPermission(false);
      toast.error(
        error.response?.data?.message || "Permission Denied: You don't have access to this page"
      );
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);
  const getdataapi = () => {
    axios.get(`${process.env.REACT_APP_BASE_URL}get-privacy`).then((response) => {
      setHeading(response.data.data.heading);
      setDescription12(response.data.data.description);
    }).catch((error) => {
      console.log(error);
    });
  };
  const handleGetData = () => {
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(description12, 'text/html');
    const extractedText = parsedDocument.body.textContent || '';
    console.log(extractedText)
    const postdata = {
      heading: heading,
      description: extractedText,
    };
    console.log(postdata)
    axios.post(`${process.env.REACT_APP_BASE_URL}privacy-policy`, postdata).then((response) => {
      toast.success(response.data.message);
    }).catch((error) => {
      toast.error(error.response.data.errors[0].msg);
      console.log(error);
    });
  };
  const handleHeadingChange = (e) => {
    setHeading(e.target.value);
  }
  return (
    <>
      {hasPermission === null ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Loading...</p>
        </div>
      ) : hasPermission === false ? (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="row manageFreight">
              <div className="col-12">
                <h4 className="freight_hd">Privacy Policy</h4>
                <div className="line"></div>
              </div>
            </div>
            <div className="text-center mt-5">
              <h3 className="text-danger">You don't have permission to access this page</h3>
            </div>
          </div>
        </div>
      ) : (
        <div className="wpWrapper">
          <div className="container-fluid">
          <div className="card ">
            <div className="card-body">
              <div className="row manageFreight">
                <div className="col-12">
                  <div className="mx-2">
                    <h4 className="freight_hd">Privacy Policy</h4>
                  </div>
                </div>
              </div>
              <div className="privacy_input">
                <input type="text" className='form-control' value={heading} placeholder='heading' name='heading' onChange={handleHeadingChange} />
              </div>
              <CKEditor
                editor={ClassicEditor}
                data={description12}
                onChange={(event, editor) => {
                  const newData = editor.getData();
                  setDescription12(newData);
                }}
              />
              <div className="text-center mt-3">
                <button onClick={handleGetData} className='blueBtn'>Update</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};
export default PrivacyPolicy;
