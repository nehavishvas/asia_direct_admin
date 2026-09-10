import axios from "axios";
import { useEffect, useState } from "react";
import { FiEye, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
export default function TaskManagerstaff() {
  const user = JSON.parse(localStorage.getItem("data123"));
  const [openModal, setOpenModal] = useState(false);
const [comment, setComment] = useState("");
const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [data, setData] = useState([]);
    const navigate = useNavigate()
  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    const payload = {
      staff_id: user.id,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}getTasksByStaffId`,
        payload,
      );
      setData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenModalnavigate=(taskId) => {
    navigate(`/Admin/task/${taskId}`);
  }
  const handleOpenModal = (taskId) => {
    console.log("Selected Task ID:", taskId);
  setSelectedTaskId(taskId);
  setOpenModal(true);
};

const handleCloseModal = () => {
  setOpenModal(false);
  setComment("");
};

const handleAddComment = async () => {
  if (!comment.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Empty Comment",
      text: "Please enter a comment",
    });
    return;
  }

  const payload = {
    task_id: selectedTaskId,
    user_id: user.id,
    comment: comment,
  };

  try {
    await axios.post(
      `${process.env.REACT_APP_BASE_URL}addTaskComment`,
      payload
    );

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Comment Added Successfully ✅",
      timer: 1500,
      showConfirmButton: false,
    });

    handleCloseModal();
    getTasks();

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Something went wrong ❌",
    });
    console.log(error);
  }
};
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Sr.No.</th>
                <th> Title</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                {/* <th>Country</th> */}
                {/* <th>Profile</th> */}
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>{item.priority}</td>
                  <td>{item.status}</td>
                  {/* <td>{item.country_name}</td> */}
                  <td>{item.created_at.split("T")[0]}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FiPlus
                        className="action-icon"
                        style={{ cursor: "pointer", color: "#be191d" }}
                        onClick={() => handleOpenModal(item.task_id)}
                        title="Add"
                      />
                      <FiEye
                        className="action-icon-view"
                        onClick={() => handleOpenModalnavigate(item.task_id)}
                        title="View"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {openModal && (
  <div className="modal d-block" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">Add Comment</h5>
          <button className="btn-close" onClick={handleCloseModal}></button>
        </div>

        <div className="modal-body">
          <textarea
            className="form-control"
            rows="4"
            placeholder="Enter comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleAddComment}>
            Submit
          </button>
        </div>

      </div>
    </div>
  </div>
)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
