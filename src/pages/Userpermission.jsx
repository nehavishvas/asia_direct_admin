import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

const TreeNode = ({ node, handleCheck }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();
  const isHeading = node.type === "heading";

  return (
    <div className="ml-4 staffPer" style={isHeading ? { marginTop: "16px" } : {}}>
      <div 
        className={`flex items-center gap-2 p-2 ${isHeading ? "bg-gray-100 font-bold rounded" : ""}`}
        style={isHeading ? { backgroundColor: "#f3f4f6", fontWeight: "bold", padding: "10px 8px" } : {}}
      >
        {node.children.length > 0 && (
          <span className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        {!isHeading && (
          <input
            type="checkbox"
            checked={node.isChecked}
            onChange={() => handleCheck(node)}
          />
        )}
        <span className="ps-2"> {node.menu_name || node.name}</span>
      </div>

      {isExpanded && (
        <div className="ml-6 border-l border-gray-200 pl-4 py-1">
          {node.children.map((child) => (
            <TreeNode key={`${child.type}-${child.id}`} node={child} handleCheck={handleCheck} />
          ))}
        </div>
      )}
    </div>
  );
};

const sortAndGroupPermissions = (data) => {
  const normalize = (str) => (str || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");

  // Deep clone to avoid mutations
  let menus = JSON.parse(JSON.stringify(data));

  const pullNode = (nameQuery) => {
    const normQuery = normalize(nameQuery);

    // 1. Check top-level menus
    const topIdx = menus.findIndex(m => {
      const nm = normalize(m.menu_name);
      return nm === normQuery || nm.includes(normQuery) || normQuery.includes(nm);
    });
    if (topIdx !== -1) {
      const node = menus[topIdx];
      menus.splice(topIdx, 1);
      return node;
    }

    // 2. Check child routes
    for (let i = 0; i < menus.length; i++) {
      const menu = menus[i];
      if (menu.children) {
        const childIdx = menu.children.findIndex(c => {
          const nc = normalize(c.name);
          return nc === normQuery || nc.includes(normQuery) || normQuery.includes(nc);
        });
        if (childIdx !== -1) {
          const node = menu.children[childIdx];
          menu.children.splice(childIdx, 1);
          return node;
        }
      }
    }

    return null;
  };

  const pullNodeByAliases = (aliases) => {
    for (let i = 0; i < aliases.length; i++) {
      const node = pullNode(aliases[i]);
      if (node) return node;
    }
    return null;
  };

  const finalTree = [];

  const addNode = (targetList, node, displayName) => {
    if (!node) return;
    if (node.type === "menu") {
      node.menu_name = displayName;
    } else {
      node.name = displayName;
    }
    targetList.push(node);
  };

  // 1. Dashboard
  const dashboardNode = pullNodeByAliases(["dashboard"]);
  addNode(finalTree, dashboardNode, "Dashboard");

  // 2. Enqueries
  const enqueriesChildren = [];
  addNode(enqueriesChildren, pullNodeByAliases(["freightbyadmin", "managefreight"]), "Freight by Admin");
  addNode(enqueriesChildren, pullNodeByAliases(["freightbyuser", "freight"]), "Freight by User");
  addNode(enqueriesChildren, pullNodeByAliases(["custombyadmin", "customclearanceorder"]), "Custom by Admin");
  addNode(enqueriesChildren, pullNodeByAliases(["custombyuser", "customclearencebyuser"]), "Custom by User");
  addNode(enqueriesChildren, pullNodeByAliases(["dispute", "query"]), "Dispute");
  addNode(enqueriesChildren, pullNodeByAliases(["notifications"]), "Notifications");

  if (enqueriesChildren.length > 0) {
    finalTree.push({
      id: "heading-enqueries",
      menu_name: "Enqueries",
      type: "heading",
      isChecked: enqueriesChildren.every(c => c.isChecked),
      children: enqueriesChildren
    });
  }

  // 3. Freight Management
  const freightChildren = [];
  addNode(freightChildren, pullNodeByAliases(["freightorders", "order"]), "Freight Orders");
  addNode(freightChildren, pullNodeByAliases(["shipments", "manageshipment"]), "Shipments");
  addNode(freightChildren, pullNodeByAliases(["releaseddashboard"]), "Released Dashboard");
  addNode(freightChildren, pullNodeByAliases(["clearanceorder", "calculationorder"]), "Clearance Order");

  if (freightChildren.length > 0) {
    finalTree.push({
      id: "heading-freightmanagement",
      menu_name: "Freight Management",
      type: "heading",
      isChecked: freightChildren.every(c => c.isChecked),
      children: freightChildren
    });
  }

  // 4. Account
  const accountChildren = [];
  addNode(accountChildren, pullNodeByAliases(["accounts", "quotes", "invoices", "invoicerecon", "sagecustomerinvoices", "cashbook", "supplierinvoice", "manageinvoices"]), "Accounts");
  addNode(accountChildren, pullNodeByAliases(["reports", "quoteitemsummary", "salesbycustomer", "salesbycustomersummary", "salesbyitem", "salesbysalesrep", "supplierbalance"]), "Reports");

  if (accountChildren.length > 0) {
    finalTree.push({
      id: "heading-account",
      menu_name: "Account",
      type: "heading",
      isChecked: accountChildren.every(c => c.isChecked),
      children: accountChildren
    });
  }

  // 5. Warehouse
  const warehouseChildren = [];
  addNode(warehouseChildren, pullNodeByAliases(["warehouseorder"]), "Warehouse Order");
  addNode(warehouseChildren, pullNodeByAliases(["supplierwarehouseorder", "supplierwarehouse"]), "Supplier Warehouse order");
  addNode(warehouseChildren, pullNodeByAliases(["batches"]), "Batches");
  addNode(warehouseChildren, pullNodeByAliases(["collectiondelivery", "managecollectiondelivery"]), "Collection & Delivery");

  if (warehouseChildren.length > 0) {
    finalTree.push({
      id: "heading-warehouse",
      menu_name: "Warehouse",
      type: "heading",
      isChecked: warehouseChildren.every(c => c.isChecked),
      children: warehouseChildren
    });
  }

  // 6. Imports
  const importsChildren = [];
  addNode(importsChildren, pullNodeByAliases(["excel", "oploadfile"]), "Excel");

  if (importsChildren.length > 0) {
    finalTree.push({
      id: "heading-imports",
      menu_name: "Imports",
      type: "heading",
      isChecked: importsChildren.every(c => c.isChecked),
      children: importsChildren
    });
  }

  // 7. User Management
  const userMgmtChildren = [];
  addNode(userMgmtChildren, pullNodeByAliases(["managecustomers", "managecustomer"]), "Manage Customers");
  addNode(userMgmtChildren, pullNodeByAliases(["managesuppliers", "managesupplier"]), "Manage Suppliers");
  addNode(userMgmtChildren, pullNodeByAliases(["managestaff"]), "Manage Staff");
  addNode(userMgmtChildren, pullNodeByAliases(["companyaddress"]), "Company Address");

  if (userMgmtChildren.length > 0) {
    finalTree.push({
      id: "heading-usermanagement",
      menu_name: "User Management",
      type: "heading",
      isChecked: userMgmtChildren.every(c => c.isChecked),
      children: userMgmtChildren
    });
  }

  // 8. Facilities Management
  const facilitiesChildren = [];
  const facilitiesNode = pullNodeByAliases(["facilitiesmanagement"]);
  if (facilitiesNode) {
    addNode(facilitiesChildren, facilitiesNode, "Facilities Management");
  } else {
    addNode(facilitiesChildren, pullNodeByAliases(["warehouse"]), "Warehouse");
    addNode(facilitiesChildren, pullNodeByAliases(["customsclearingagent"]), "Customs Clearing Agent");
    addNode(facilitiesChildren, pullNodeByAliases(["freightforwarder"]), "Freight Forwarder");
    addNode(facilitiesChildren, pullNodeByAliases(["groupagehandler"]), "Groupage Handler");
    addNode(facilitiesChildren, pullNodeByAliases(["roadtransport"]), "Road Transport");
  }

  if (facilitiesChildren.length > 0) {
    finalTree.push({
      id: "heading-facilitiesmanagement",
      menu_name: "Facilities Management",
      type: "heading",
      isChecked: facilitiesChildren.every(c => c.isChecked),
      children: facilitiesChildren
    });
  }

  // 9. User Control
  const userCtrlChildren = [];
  addNode(userCtrlChildren, pullNodeByAliases(["countryoforigin"]), "Country Of Origin");
  addNode(userCtrlChildren, pullNodeByAliases(["addlinks", "link"]), "Add Links");
  addNode(userCtrlChildren, pullNodeByAliases(["termsandconditions", "termconditions"]), "Terms and Conditions");
  addNode(userCtrlChildren, pullNodeByAliases(["privacypolicy"]), "Privacy Policy");
  addNode(userCtrlChildren, pullNodeByAliases(["filesstorage", "notificaionstorage"]), "Files & Storage");

  if (userCtrlChildren.length > 0) {
    finalTree.push({
      id: "heading-usercontrol",
      menu_name: "User Control",
      type: "heading",
      isChecked: userCtrlChildren.every(c => c.isChecked),
      children: userCtrlChildren
    });
  }

  // 10. Append any other unmatched nodes so they aren't lost
  if (menus.length > 0) {
    menus.forEach(remainingNode => {
      finalTree.push(remainingNode);
    });
  }

  return finalTree;
};

// Helper to sync headings checked state based on children
const syncHeadingsCheckedState = (nodes) => {
  return nodes.map(n => {
    if (n.type === "heading" && n.children && n.children.length > 0) {
      const syncedChildren = syncHeadingsCheckedState(n.children);
      const allChecked = syncedChildren.every(c => c.isChecked);
      return {
        ...n,
        isChecked: allChecked,
        children: syncedChildren
      };
    }
    if (n.children && n.children.length > 0) {
      return {
        ...n,
        children: syncHeadingsCheckedState(n.children)
      };
    }
    return n;
  });
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
          type: "menu",
          isChecked: menu.is_checked === 1,
          children: menu.menu_Routes
            ? menu.menu_Routes.map((route) => ({
              id: route.id,
              name: route.name || route.route_url,
              type: "route",
              isChecked: route.is_checked === 1,
              children: [],
            }))
            : [],
        }));

        const sortedData = sortAndGroupPermissions(transformedData);
        const syncedData = syncHeadingsCheckedState(sortedData);
        setTreeData(syncedData);

        // Collect all checked permission IDs initially
        const collectCheckedIds = (nodes) => {
          let ids = [];
          nodes.forEach((n) => {
            if (n.isChecked && !(typeof n.id === "string" && n.id.startsWith("heading-"))) {
              ids.push(n.id);
            }
            if (n.children && n.children.length > 0) {
              ids = [...ids, ...collectCheckedIds(n.children)];
            }
          });
          return ids;
        };

        setStaffPermissions(collectCheckedIds(syncedData));
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

    // Helper to recursively update checked state of a node and all its descendants
    const updateAllDescendants = (n) => ({
      ...n,
      isChecked: isChecked,
      children: n.children ? n.children.map(updateAllDescendants) : [],
    });

    // Update checked state in the tree
    const updateCheckedState = (nodes) =>
      nodes.map((n) => {
        if (n.id === node.id && n.type === node.type) {
          return updateAllDescendants(n);
        }
        return {
          ...n,
          children: updateCheckedState(n.children),
        };
      });

    const newTreeData = syncHeadingsCheckedState(updateCheckedState(treeData));
    setTreeData(newTreeData);

    // Collect all checked IDs from the updated tree data
    const collectCheckedIds = (nodes) => {
      let ids = [];
      nodes.forEach((n) => {
        if (n.isChecked && !(typeof n.id === "string" && n.id.startsWith("heading-"))) {
          ids.push(n.id);
        }
        if (n.children && n.children.length > 0) {
          ids = [...ids, ...collectCheckedIds(n.children)];
        }
      });
      return ids;
    };

    setStaffPermissions(collectCheckedIds(newTreeData));
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
              <TreeNode key={`${node.type}-${node.id}`} node={node} handleCheck={handleCheck} />
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
