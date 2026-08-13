import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Select from "react-select";
import CloseIcon from "@mui/icons-material/Close";
import { Modal } from "bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
const pageSize = 10;
const Notification = () => {
  const [data, setData] = useState([]);
  const [inpdata, setInpdata] = useState({
    send_to: "",
    user_id: "",
    title: "",
    description: "",
    send_whatsapp: false, // ✅ ADD THIS
  });
  const [showContent, setShowContent] = useState(false);
  const [showContent1, setShowContent1] = useState(false);
  const [showMultiUser, setShowMultiUser] = useState(false);
  const [showBatchUser, setShowBatchUser] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [clientlist, setClientlist] = useState([]);
  const [stafflist, setStafflist] = useState([]);
  const [batchlist1, setBatchlist1] = useState([]);
  const [batchUserList, setBatchUserList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState({});
  const titleRef = useRef();
  const messageRef = useRef();
  const documentRef = useRef();
  const showdata = async (page = 1, search = "") => {
    try {
      const payload = {
        page: page,
        limit: pageSize,
        search: search,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}notification-list`,
        payload
      );

      setData(response?.data?.data || []);
      setTotalPage(response?.data?.totalPages || 1);

    } catch (err) {
      console.error(err);
      setError("Failed to load notifications");
    }
  };
  const handledelete = (id) => {
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
          .post(`${process.env.REACT_APP_BASE_URL}delete-notification`, {
            notification_id: id,
          })
          .then((response) => {
            toast.success(response.data.message);
            showdata();
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });
      }
    });
  };
  const handlechange = (e) => {
    const { name, value } = e.target;
    setInpdata({ ...inpdata, [name]: value });
    if (name === "send_to") {
      setShowContent(value === "4");
      setShowContent1(value === "3");
      setShowMultiUser(value === "5");
      setShowBatchUser(value === "6");
      if (value === "3" || value === "5" || value === "6") {
        axios
          .get(`${process.env.REACT_APP_BASE_URL}clientlist`)
          .then((response) => {
            setClientlist(response.data.data);
          });
      }
      if (value === "4") {
        axios
          .get(`${process.env.REACT_APP_BASE_URL}staff-list`)
          .then((response) => {
            setStafflist(response.data.data);
          });
      }
      if (value === "6") {
        axios
          .get(`${process.env.REACT_APP_BASE_URL}getBatchList`)
          .then((response) => {
            setBatchlist1(response.data.data);
          });
      }
    }
  };
  const handlechangeFile = (e) => {
    const { name, files } = e.target;
    setInpdata({ ...inpdata, [name]: files[0] });
  };
  const handleBatchChange = (e) => {
    const id = e.target.value;
    setBatchId(id);
    if (id) {
      axios
        .post(`${process.env.REACT_APP_BASE_URL}getClientByBatchId`, {
          batch_id: id,
        })
        .then((response) => {
          setBatchUserList(response.data.data);
          const userIds = response.data.data.map((item) => item.id).join(",");
          setInpdata({ ...inpdata, user_id: userIds });
        })
        .catch((error) => {
          console.log("i");
        });
    } else {
      setBatchUserList([]);
      setInpdata({ ...inpdata, user_id: "" });
    }
  };
  const handelvalidate = (value) => {
    let error = {};
    if (!value.title) error.title = "Title is required";
    if (!value.description) error.description = "Description is required";
    if (!error.title && !error.description) {
      apihit();
    }
    setError(error);
  };
  const postdata = () => {
    handelvalidate(inpdata);
  };
  const apihit = () => {
    const inpdata1 = new FormData();
    inpdata1.append("send_to", inpdata.send_to);
    inpdata1.append("batch_id", parseInt(batchId));
    inpdata1.append("user_id", inpdata.user_id);
    inpdata1.append("title", inpdata.title);
    inpdata1.append("description", inpdata.description);
    inpdata1.append("send_whatsapp", inpdata.send_whatsapp ? "1" : "0");
    if (documentRef.current && documentRef.current.files.length > 0) {
      Array.from(documentRef.current.files).forEach((file) => {
        inpdata1.append("document", file);
      });
    }
    axios
      .post(`${process.env.REACT_APP_BASE_URL}send-notification`, inpdata1)
      .then((response) => {
        if (response.data?.success === false) {
          toast.error(response.data.message || "Operation failed");
          return;
        }
        toast.success(
          response.data?.message || "Notification sent successfully",
        );
        const modalEl = document.getElementById("exampleModal");
        const modalInstance = Modal.getOrCreateInstance(modalEl);
        modalInstance.hide();
        setTimeout(() => {
          document
            .querySelectorAll(".modal-backdrop")
            .forEach((el) => el.remove());
          document.body.classList.remove("modal-open");
          document.body.style = "";
        }, 300);
        if (titleRef.current) titleRef.current.value = "";
        if (messageRef.current) messageRef.current.value = "";
        if (documentRef.current) documentRef.current.value = "";
        setInpdata({
          send_to: "",
          user_id: "",
          title: "",
          description: "",
          send_whatsapp: false, // ✅ reset checkbox
        });
        setSelectedUsers([]);
        setShowContent(false);
        setShowContent1(false);
        setShowMultiUser(false);
        setShowBatchUser(false);
        setBatchId("");
        setBatchUserList([]);
        showdata();
      })
      .catch((error) => {
        const errorMessage =
          error?.response?.data?.message || error?.message || "Server error";
        toast.error(errorMessage);
      });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  useEffect(() => {
    showdata(currentPage, searchQuery);
  }, [currentPage, searchQuery]);
  // const totalPage = Math.ceil(data.length / pageSize);
  // const startIndex = (currentPage - 1) * pageSize;
  // const currentdata = data.slice(startIndex, startIndex + pageSize);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setInpdata({ ...inpdata, [name]: checked });
  };
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid  ">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Notification</h4>
            <div className="d-flex gap-2 manageFreight">
              <div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // reset page on search
                  }}
                />

              </div>
              <div>

                <button
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal"
                  className="blueBtn"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
          <div className="modal fade" id="exampleModal" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Notification</h5>
                  <button className="btn-close" data-bs-dismiss="modal">
                    <CloseIcon />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    {[
                      { label: "All User", value: "2" },
                      { label: "All Staff", value: "1" },
                      { label: "Particular User", value: "3" },
                      { label: "Particular Staff", value: "4" },
                      { label: "Multiple Users", value: "5" },
                      { label: "Users by Batch", value: "6" },
                      { label: "All Supplier", value: "7" },
                    ].map((opt) => (
                      <label key={opt.value}>
                        <input
                          type="radio"
                          value={opt.value}
                          name="send_to"
                          onChange={handlechange}
                        />{" "}
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {showContent1 && (
                    <div className="mb-3">
                      <label>Particular User</label>
                      <select
                        name="user_id"
                        className="form-control"
                        onChange={handlechange}
                      >
                        <option value="">Select...</option>
                        {clientlist.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.client_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {showContent && (
                    <div className="mb-3">
                      <label>Particular Staff</label>
                      <select
                        name="user_id"
                        className="form-control"
                        onChange={handlechange}
                      >
                        <option value="">Select...</option>
                        {stafflist.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {showMultiUser && (
                    <div className="mb-3">
                      <label>Multiple Users</label>
                      <Select
                        isMulti
                        options={clientlist.map((item) => ({
                          value: item.id,
                          label: item.client_name,
                        }))}
                        classNamePrefix="select"
                        onChange={(selectedOptions) => {
                          const ids = selectedOptions.map((opt) => opt.value);
                          setSelectedUsers(ids);
                          setInpdata({ ...inpdata, user_id: ids.join(",") });
                        }}
                        value={clientlist
                          .filter((item) => selectedUsers.includes(item.id))
                          .map((item) => ({
                            value: item.id,
                            label: item.client_name,
                          }))}
                      />
                    </div>
                  )}
                  {showBatchUser && (
                    <>
                      <div className="mb-3">
                        <label>Select Batch</label>
                        <select
                          className="form-control"
                          onChange={handleBatchChange}
                        >
                          <option value="">Select Batch</option>
                          {batchlist1.map((batch) => (
                            <option key={batch.id} value={batch.id}>
                              {batch.batch_number}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div className="mb-3">
                    <div className="mb-3">
                      <input
                        type="checkbox"
                        id="send_whatsapp"
                        name="send_whatsapp"
                        checked={inpdata.send_whatsapp || false}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="whatsapp" className="ms-2">
                        WhatsApp
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      onChange={handlechange}
                      ref={titleRef}
                    />
                    <p className="text-danger">{error.title}</p>
                  </div>
                  <div className="mb-3">
                    <label>Attach Document</label>
                    <input
                      type="file"
                      multiple
                      name="document"
                      className="form-control"
                      ref={documentRef}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Message</label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={inpdata.description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setInpdata({ ...inpdata, description: data });
                      }}
                      config={{
                        toolbar: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "underline",
                          "strikethrough",
                          "|",
                          "fontSize",
                          "fontFamily",
                          "fontColor",
                          "fontBackgroundColor",
                          "|",
                          "bulletedList",
                          "numberedList",
                          "|",
                          "alignment",
                          "|",
                          "link",
                          "undo",
                          "redo",
                        ],
                      }}
                    />
                    <p className="text-danger">{error.description}</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={postdata} className="btn btn-primary">
                    Send Notification
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="table-responsive mt-2">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Sr.No.</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Documents</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  const date = new Date(item?.created_at);
                  const formattedDate = date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>{item.title}</td>
                      <td
                        dangerouslySetInnerHTML={{
                          __html: item.description,
                        }}
                      ></td>
                      <td>{formattedDate}</td>
                      <td>
                        {Array.isArray(item.document) &&
                          item.document.map((doc, index) => (
                            <a
                              key={index}
                              href={`${process.env.REACT_APP_BASE_URLdocument}${doc}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "block" }}
                            >
                              View Document {index + 1}
                            </a>
                          ))}
                      </td>
                      <td>
                        <AiFillDelete
                          className="text-danger"
                          style={{ cursor: "pointer" }}
                          onClick={() => handledelete(item.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-center d-flex justify-content-end align-items-center">
              {/* <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="bg_page"
              >
               <i class="fi fi-rr-angle-small-left page_icon"></i>
              </button>
              <span className="mx-2">{`Page ${currentPage} of ${totalPage}`}</span>
              <button
                disabled={currentPage === totalPage}
                onClick={() => handlePageChange(currentPage + 1)}
                className="bg_page"
              >
                  <i class="fi fi-rr-angle-small-right page_icon"></i>
              </button> */}
              <button
                disabled={currentPage === 1}
                className="bg_page"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <i class="fi fi-rr-angle-small-left page_icon"></i>
              </button>

              <span>
                Page {currentPage} of {totalPage}
              </span>

              <button
                className="bg_page"
                disabled={currentPage === totalPage}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <i class="fi fi-rr-angle-small-right page_icon"></i>
              </button>
            </div>
          </div>
        </div>

        
      </div>
    </>
  );
};

export default Notification;