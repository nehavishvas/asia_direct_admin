import Multiselect from "multiselect-react-dropdown";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Sidebar = () => {
  
  const [options, setOptions] = useState();
  const [selectedValues, setSelectedValues] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.37:4000/api/supplier-list"
        );
        setOptions(response.data.data);
      } catch (error) {
        toast.error(error);
      }
    };

    fetchData();
  }, []);

  const onSelect = (selectedList, selectedItem) => {
    const selectedId = selectedItem.id;
  };

  const onRemove = (selectedList, removedItem) => {
    const removedId = removedItem.id;
  };

  return (
    <Multiselect
      options={options}
      selectedValues={selectedValues}
      onSelect={onSelect}
      onRemove={onRemove}
      displayValue="name"
    />
  );
};

export default Sidebar;