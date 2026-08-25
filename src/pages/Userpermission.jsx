import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

const TreeNode = ({ node, handleCheck }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();
  return (
    <div className="ml-4 staffPer">
      <div className="flex items-center gap-2 p-2">
        {node.children.length > 0 && (
          <span className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        <input
          type="checkbox"
          checked={node.isChecked}
          onChange={() => handleCheck(node)}
        />
        <span className="ps-2"> {node.menu_name || node.name}</span>
      </div>

      {isExpanded && (
        <div className="ml-4 border-l-2 border-gray-300 pl-2 dropPermission">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} handleCheck={handleCheck} />
          ))}
        </div>
      )}
    </div>
  );
};

const UserPermission = ({ staffId }) => {
  const [treeData, setTreeData] = useState([]);
  const [staffPermissions, setStaffPermissions] = useState([]); // Store checked permissions
  const navigate = useNavigate();
  useEffect(() => {
    const getTreeData = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}getStaffPermissionsById`,
          { staff_id: staffId?.id }
        );

        const transformedData = response.data.data.map((menu) => ({
          id: menu.id,
          menu_name: menu.menu_name,
          isChecked: menu.is_checked === 1,
          children: menu.menu_Routes
            ? menu.menu_Routes.map((route) => ({
              id: route.id,
              name: route.name || route.route_url,
              isChecked: route.is_checked === 1,
              children: [],
            }))
            : [],
        }));

        setTreeData(transformedData);

        // Collect all checked permission IDs initially
        const checkedIds = transformedData.flatMap((menu) => {
          const menuPermissions = menu.isChecked ? [menu.id] : [];
          const routePermissions = menu.children
            .filter((route) => route.isChecked)
            .map((route) => route.id);
          return [...menuPermissions, ...routePermissions];
        });

        setStaffPermissions(checkedIds);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (staffId) {
      getTreeData();
    }
  }, [staffId]);

  // Handle checkbox selection & update staffPermissions array
  const handleCheck = (node) => {
    const isChecked = !node.isChecked;

    // Update checked state in tree
    const updateCheckedState = (nodes) =>
      nodes.map((n) => ({
        ...n,
        isChecked: n.id === node.id ? isChecked : n.isChecked,
        children: updateCheckedState(n.children),
      }));

    setTreeData(updateCheckedState(treeData));

    // Update permissions array
    setStaffPermissions((prevPermissions) =>
      isChecked
        ? [...prevPermissions, node.id] // Add if checked
        : prevPermissions.filter((id) => id !== node.id) // Remove if unchecked
    );
  };

  // Send updated permissions to API
  const handleUpdate = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}updateStaffPermission`, {
        staff_id: staffId?.id,
        staff_permissions: staffPermissions, // Send full updated array
      });
      alert("Permissions updated successfully!");
    } catch (error) {
      console.error("Error updating permissions:", error);
    }
  };

  const handleclicknav = () => {
    navigate("/Admin/manage-staff");
    // window.history.back();
  }

  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div>
          <div className="d-flex">
            <ArrowBack style={{ cursor: "pointer" }} onClick={handleclicknav} />
            {" "}<h4 className="text-xl font-bold mb-2">Staff Permissions</h4>
          </div>
          <div className="bg-white shadow-md rounded mainPer">
            {treeData.map((node) => (
              <TreeNode key={node.id} node={node} handleCheck={handleCheck} />
            ))}
          </div>
          <button onClick={handleUpdate} className="btn btn-secondary mt-3">
            Update Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermission;
