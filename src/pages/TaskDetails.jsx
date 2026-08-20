// // import React from 'react'
// // import { useParams } from "react-router-dom";

// // export default function TaskDetails() {
// //     const { id } = useParams();
// //   return (
// //     <div>
      
// //     </div>
// //   )
// // }
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// export default function TaskDetails() {
//   const { id } = useParams(); // task_id
//   const [comments, setComments] = useState([]);

//   useEffect(() => {
//     getComments();
//   }, [id]);

//   const getComments = async () => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BASE_URL}getTaskComments`,
//         { task_id: id }
//       );

//       setComments(response.data.data || []);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h3>Task Comments</h3>

//       {comments.length === 0 ? (
//         <p>No comments found</p>
//       ) : (
//         <div className="list-group">
//           {comments.map((item, index) => (
//             <div key={index} className="list-group-item">
//               <p className="mb-1 bold">{item.full_name}</p>
//               <p className="mb-1">{item.comment}</p>
//               <small className="text-muted">
//                 {item.created_at?.split("T")[0]}
//               </small>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowBack } from "@mui/icons-material";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    getComments();
  }, [id]);

  const getComments = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}getTaskComments`,
        { task_id: id }
      );

      setComments(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <ArrowBack style={{ cursor: "pointer", marginRight: "10px" }} onClick={() => navigate(-1)} />
        <h3 className="mb-0">Task Comments</h3>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="">
            <tr>
              <th>Sr. No</th>
              <th>User Name</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No comments found
                </td>
              </tr>
            ) : (
              comments.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.full_name}</td>
                  <td>{item.comment}</td>
                  <td>{item.created_at?.split("T")[0]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}