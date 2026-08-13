import React, { useEffect, useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
import { toast } from "react-toastify";

const TermConditions = () => {
  const [description12, setDescription12] = useState([]);
  const [heading, setHeading] = useState('');
  useEffect(() => {
    getdataapi();
  }, []);
  const getdataapi = () => {
    axios.get(`${process.env.REACT_APP_BASE_URL}get-terms`).then((response) => {
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
    const postdata = {
      heading: heading,
      description: extractedText,
    };
    axios.post(`${process.env.REACT_APP_BASE_URL}term-condition`, postdata).then((response) => {
      toast.success(response.data.message);
    }).catch((error) => {
      toast.error(error.response.data.errors[0].msg);
      console.log(error);
    });
  };
  const handleHeadingChange = (e) => {
    setHeading(e.target.value);
  };

  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="card ">
            <div className="card-body">
              <div className="row manageFreight">
                <div className="col-12">
                  <div className="">
                    <h4 className="freight_hd">Terms and Conditions</h4>
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
                <button onClick={handleGetData} className='privacy_btn'>Update</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      

    </>
  );
};

export default TermConditions;
